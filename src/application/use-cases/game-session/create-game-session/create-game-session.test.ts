import { DatabaseError, GameSession, type GameSessionRepository } from '@app/domain';
import type { GameConnection } from '@app/ports';
import { fail, ok } from '@shared/result';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CreateGameSession } from './create-game-session';

describe('CreateGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameConnection = mock<GameConnection>();

  const useCase = new CreateGameSession(gameSessionRepository, gameConnection);

  beforeEach(() => {
    gameSessionRepository.save.mockResolvedValue(ok(undefined));
  });

  it('returns a ValidationError if game session creation fails due to invalid name', async () => {
    const error = (await useCase.execute({ name: 'a' })).getError();

    expect(error).toMatchObject({ code: 'ValidationError', field: 'name' });
  });

  it('returns a DatabaseError if game session repository fails while saving', async () => {
    gameSessionRepository.save.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (await useCase.execute({ name: 'Some name' })).getError();

    expect(error).toMatchObject({ code: 'DatabaseError' });
    expect(gameSessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Some name' })
    );
  });

  it('creates a session in the game connection and returns the game session DTO', async () => {
    const gameSessionCreateSpy = vi.spyOn(GameSession, 'create');

    const gameSessionDTO = (await useCase.execute({ name: 'Some name' })).getData();

    const gameSession = gameSessionCreateSpy.mock.results[0].value.data;
    expect(gameSessionDTO).toMatchObject({ name: 'Some name' });
    expect(gameSessionDTO).not.toBeInstanceOf(GameSession);
    expect(gameConnection.createSession).toHaveBeenCalledWith(gameSession.id);
  });
});
