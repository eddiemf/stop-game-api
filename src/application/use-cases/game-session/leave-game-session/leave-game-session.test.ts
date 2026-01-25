import {
  BroadcastToGameSessionError,
  DatabaseError,
  GameSession,
  type GameSessionRepository,
  LeaveGameSessionError,
  Player,
} from '@app/domain';
import type { GameConnection } from '@app/ports';
import { fail, ok } from '@shared/result';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { LeaveGameSession } from './leave-game-session';

describe('LeaveGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameConnection = mock<GameConnection>();

  const useCase = new LeaveGameSession(gameSessionRepository, gameConnection);

  beforeEach(() => {
    const player = Player.create({ userId: 'userId', name: 'Test Player' }).getData();
    const gameSession = GameSession.create({ name: 'Test Session', players: [player] }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));
    gameSessionRepository.save.mockResolvedValue(ok(undefined));
    gameConnection.removePlayerFromSession.mockReturnValue(ok(undefined));
    gameConnection.broadcastToSession.mockReturnValue(ok(undefined));
  });

  it('returns a DatabaseError if finding the game session fails', async () => {
    gameSessionRepository.findById.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (await useCase.execute({ sessionId: 'sessionId', userId: 'userId' })).getError();

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(error.code).toEqual('DatabaseError');
  });

  it('returns a GameSessionNotFoundError if the game session could not be found', async () => {
    gameSessionRepository.findById.mockResolvedValue(ok(null));

    const error = (await useCase.execute({ sessionId: 'sessionId', userId: 'userId' })).getError();

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(error.code).toEqual('GameSessionNotFoundError');
  });

  it('returns a PlayerNotInSessionError if the player is not in the game session', async () => {
    const error = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'id-not-in-session' })
    ).getError();

    expect(error.code).toBe('PlayerNotInSessionError');
  });

  it('returns a DatabaseError if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (await useCase.execute({ sessionId: 'sessionId', userId: 'userId' })).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(error.code).toBe('DatabaseError');
  });

  it('returns a LeaveGameSessionError if disconnecting the player fails', async () => {
    gameConnection.removePlayerFromSession.mockReturnValue(
      fail(new LeaveGameSessionError('Error'))
    );

    const error = (await useCase.execute({ sessionId: 'sessionId', userId: 'userId' })).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameConnection.removePlayerFromSession).toHaveBeenCalledWith(gameSession.id, 'userId');
    expect(error.code).toBe('LeaveGameSessionError');
  });

  it('returns a BroadcastToGameSessionError if broadcasting the game session fails', async () => {
    gameConnection.broadcastToSession.mockReturnValue(
      fail(new BroadcastToGameSessionError('Error'))
    );

    const error = (await useCase.execute({ sessionId: 'sessionId', userId: 'userId' })).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameConnection.broadcastToSession).toHaveBeenCalledWith(gameSession.id, {
      type: 'PLAYER_LEFT',
      payload: {
        player: expect.objectContaining({ userId: 'userId', name: 'Test Player' }),
        gameSession: expect.objectContaining({ name: 'Test Session' }),
      },
    });
    expect(error.code).toBe('BroadcastToGameSessionError');
  });

  it('returns Ok if the player leaves the game session successfully', async () => {
    const result = await useCase.execute({
      sessionId: 'sessionId',
      userId: 'userId',
    });
    if (!result.isOk) throw 'Expected success';

    expect(result.data).toBeUndefined();
  });
});
