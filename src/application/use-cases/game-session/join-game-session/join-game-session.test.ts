import {
  BroadcastToGameSessionError,
  DatabaseError,
  GameSession,
  type GameSessionRepository,
  JoinGameSessionError,
  Player,
} from '@app/domain';
import type { GameConnection } from '@app/ports';
import { fail, ok } from '@shared/result';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { JoinGameSession } from './join-game-session';

describe('JoinGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameConnection = mock<GameConnection>();

  const useCase = new JoinGameSession(gameSessionRepository, gameConnection);

  beforeEach(() => {
    const gameSession = GameSession.create({ name: 'Test Session' }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));
    gameSessionRepository.save.mockResolvedValue(ok(undefined));
    gameConnection.addPlayerToSession.mockReturnValue(ok(undefined));
    gameConnection.broadcastToSession.mockReturnValue(ok(undefined));
  });

  it('returns a ValidationError if the player creation fails due to invalid input', async () => {
    const error = (
      await useCase.execute({ sessionId: 'sessionId', playerName: 'a', userId: 'userId' })
    ).getError();

    expect(error).toMatchObject({ code: 'ValidationError', field: 'name' });
  });

  it('returns a DatabaseError if finding the game session fails', async () => {
    gameSessionRepository.findById.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', playerName: 'Some name', userId: 'userId' })
    ).getError();

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(error.code).toBe('DatabaseError');
  });

  it('returns a GameSessionNotFoundError error if the game session could not be found', async () => {
    gameSessionRepository.findById.mockResolvedValue(ok(null));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', playerName: 'Some name', userId: 'userId' })
    ).getError();

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(error.code).toBe('GameSessionNotFoundError');
  });

  it('returns a PlayerAlreadyInGameSessionError if the player is already in the game session', async () => {
    const player = Player.create({ name: 'Some name', userId: 'userId' }).getData();
    const gameSession = GameSession.create({ name: 'Test Session', players: [player] }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', playerName: 'Other name', userId: 'userId' })
    ).getError();

    expect(error.code).toBe('PlayerAlreadyInGameSessionError');
  });

  it('returns a DatabaseError if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', playerName: 'Some name', userId: 'userId' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(error.code).toBe('DatabaseError');
  });

  it('returns a JoinGameSessionError if adding the player to the game connection session fails', async () => {
    gameConnection.addPlayerToSession.mockReturnValue(fail(new JoinGameSessionError('Error')));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', playerName: 'Some name', userId: 'userId' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameConnection.addPlayerToSession).toHaveBeenCalledWith(gameSession.id, 'userId');
    expect(error.code).toBe('JoinGameSessionError');
  });

  it('returns a BroadcastToGameSessionError if broadcasting the player joined event fails', async () => {
    gameConnection.broadcastToSession.mockReturnValue(
      fail(new BroadcastToGameSessionError('Error'))
    );

    const error = (
      await useCase.execute({ sessionId: 'sessionId', playerName: 'Some name', userId: 'userId' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameConnection.broadcastToSession).toHaveBeenCalledWith(gameSession.id, {
      type: 'PLAYER_JOINED',
      payload: {
        player: expect.objectContaining({ userId: 'userId', name: 'Some name' }),
        gameSession: expect.objectContaining({ id: gameSession.id }),
      },
    });
    expect(error.code).toBe('BroadcastToGameSessionError');
  });

  it('returns the game session DTO on success', async () => {
    const gameSessionDTO = (
      await useCase.execute({ sessionId: 'sessionId', playerName: 'Some name', userId: 'userId' })
    ).getData();

    expect(gameSessionDTO).toMatchObject({
      id: gameSessionDTO.id,
      name: gameSessionDTO.name,
      players: [{ userId: 'userId', name: 'Some name' }],
    });
    expect(gameSessionDTO).not.toBeInstanceOf(GameSession);
  });
});
