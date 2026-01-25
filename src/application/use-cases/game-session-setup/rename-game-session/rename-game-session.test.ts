import {
  BroadcastToGameSessionError,
  DatabaseError,
  GameSession,
  type GameSessionRepository,
  Player,
} from '@app/domain';
import type { GameConnection } from '@app/ports';
import { fail, ok } from '@shared/result/result';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { RenameGameSession } from './rename-game-session';

describe('RenameGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameConnection = mock<GameConnection>();

  const useCase = new RenameGameSession(gameSessionRepository, gameConnection);

  beforeEach(() => {
    const player = Player.create({ userId: 'userId', name: 'Player name' }).getData();
    const gameSession = GameSession.create({ name: 'Test session', players: [player] }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));
    gameSessionRepository.save.mockResolvedValue(ok(undefined));
    gameConnection.broadcastToSession.mockReturnValue(ok(undefined));
  });

  it('returns a DatabaseError if finding the game session fails', async () => {
    gameSessionRepository.findById.mockResolvedValueOnce(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({ gameSessionId: 'sessionId', userId: 'userId', name: 'New Name' })
    ).getError();

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(error.code).toBe('DatabaseError');
  });

  it('returns a GameSessionNotFoundError if the game session could not be found', async () => {
    gameSessionRepository.findById.mockResolvedValueOnce(ok(null));

    const error = (
      await useCase.execute({ gameSessionId: 'sessionId', userId: 'userId', name: 'New name' })
    ).getError();

    expect(error.code).toBe('GameSessionNotFoundError');
  });

  it('returns a UserNotInGameSessionError if the user is not in the game session', async () => {
    const error = (
      await useCase.execute({
        gameSessionId: 'sessionId',
        userId: 'not-in-session',
        name: 'New name',
      })
    ).getError();

    expect(error.code).toBe('UserNotInGameSessionError');
  });

  it('returns a ValidationError if the new name is invalid', async () => {
    const error = (
      await useCase.execute({ gameSessionId: 'sessionId', userId: 'userId', name: '' })
    ).getError();

    expect(error.code).toBe('ValidationError');
  });

  it('returns a DatabaseError if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({ gameSessionId: 'sessionId', userId: 'userId', name: 'New name' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(error.code).toBe('DatabaseError');
  });

  it('returns a BroadcastToGameSessionError if broadcasting to the session fails', async () => {
    gameConnection.broadcastToSession.mockReturnValueOnce(
      fail(new BroadcastToGameSessionError('Error'))
    );

    const error = (
      await useCase.execute({ gameSessionId: 'sessionId', userId: 'userId', name: 'New name' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameConnection.broadcastToSession).toHaveBeenCalledWith('sessionId', {
      type: 'GAME_SESSION_RENAMED',
      payload: {
        gameSession: expect.objectContaining({ id: gameSession.id, name: 'New name' }),
      },
    });
    expect(error.code).toBe('BroadcastToGameSessionError');
  });

  it('renames the game session', async () => {
    const result = (
      await useCase.execute({
        gameSessionId: 'sessionId',
        userId: 'userId',
        name: 'New name',
      })
    ).getData();

    expect(result).toBeUndefined();
  });
});
