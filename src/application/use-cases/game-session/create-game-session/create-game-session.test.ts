import { DatabaseError, type GameSessionRepository } from '@app/domain';
import { GameSessionMapper } from '@app/mappers';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok } from '@shared/result';
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CreateGameSession } from './create-game-session';

vitest.mock('@app/mappers/game-session-mapper');

describe('CreateGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameSessionService = mock<GameSessionService>();
  const gameSessionMapper = vitest.mocked(GameSessionMapper);
  const useCase = new CreateGameSession(gameSessionRepository, gameSessionService);

  beforeEach(() => {
    gameSessionRepository.save.mockResolvedValue(Ok(undefined));
    // @ts-expect-error
    gameSessionMapper.toDTO.mockReturnValue('mocked game session');
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('returns a ValidationError error if game session creation fails due to invalid name', async () => {
    const result = await useCase.execute({ name: 'a' });
    if (result.isOk) throw 'Expected result to be an Error';

    expect(result.error.code).toEqual('ValidationError');
  });

  it('returns a DatabaseError error if game session repository fails while saving', async () => {
    gameSessionRepository.save.mockResolvedValue(Fail(new DatabaseError('Error')));

    const result = await useCase.execute({ name: 'Some name' });
    if (result.isOk) throw 'Expected result to be an Error';

    expect(result.error.code).toEqual('DatabaseError');
    expect(gameSessionRepository.save).toHaveBeenCalled();
  });

  it('creates the session and returns the game session DTO', async () => {
    const result = await useCase.execute({ name: 'Some name' });
    if (!result.isOk) throw 'Expected result to be Ok';

    expect(result.data).toEqual('mocked game session');
    expect(gameSessionService.createSession).toHaveBeenCalledWith('some-id');
  });
});
