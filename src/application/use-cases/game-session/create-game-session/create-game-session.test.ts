import {
  DatabaseError,
  GameSession,
  type GameSessionRepository,
  ValidationError,
} from '@app/domain';
import { GameSessionMapper } from '@app/mappers';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok } from '@shared/result';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CreateGameSession } from './create-game-session';

vi.mock('@app/mappers/game-session-mapper');
vi.mock('@app/domain/game-session');

describe('CreateGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameSessionService = mock<GameSessionService>();
  const GameSessionFactory = vi.mocked(GameSession);
  const gameSession = mock<GameSession>();
  const gameSessionMapper = vi.mocked(GameSessionMapper);

  const useCase = new CreateGameSession(gameSessionRepository, gameSessionService);

  beforeEach(() => {
    GameSessionFactory.create.mockReturnValue(Ok(gameSession));
    gameSessionRepository.save.mockResolvedValue(Ok(undefined));
    gameSession.getId.mockReturnValue('session-id');
    // @ts-expect-error
    gameSessionMapper.toDTO.mockReturnValue('mocked game session');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns a ValidationError if game session creation fails due to invalid name', async () => {
    GameSessionFactory.create.mockReturnValue(Fail(new ValidationError('name', 'Error')));

    const result = await useCase.execute({ name: 'invalid name' });
    if (result.isOk) throw 'Expected result to be an Error';

    expect(GameSessionFactory.create).toHaveBeenCalledWith({ name: 'invalid name' });
    expect(result.error.code).toEqual('ValidationError');
  });

  it('returns a DatabaseError if game session repository fails while saving', async () => {
    gameSessionRepository.save.mockResolvedValue(Fail(new DatabaseError('Error')));

    const result = await useCase.execute({ name: 'Some name' });
    if (result.isOk) throw 'Expected result to be an Error';

    expect(result.error.code).toEqual('DatabaseError');
    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
  });

  it('creates the session and returns the game session DTO', async () => {
    const result = await useCase.execute({ name: 'Some name' });
    if (!result.isOk) throw 'Expected result to be Ok';

    expect(result.data).toEqual('mocked game session');
    expect(gameSessionService.createSession).toHaveBeenCalledWith('session-id');
  });
});
