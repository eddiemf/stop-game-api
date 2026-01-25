import {
  BroadcastToGameSessionError,
  DatabaseError,
  GameSession,
  type GameSessionRepository,
  GameSessionState,
  GameTopic,
  Player,
} from '@app/domain';
import type { GameConnection } from '@app/ports/game-connection';
import { fail, ok } from '@shared/result';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { AddTopic } from './add-topic';

describe('AddTopic', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameConnection = mock<GameConnection>();

  const useCase = new AddTopic(gameSessionRepository, gameConnection);

  beforeEach(() => {
    const player = Player.create({ name: 'User', userId: 'userId' }).getData();
    const gameSession = GameSession.create({
      name: 'Test Session',
      players: [player],
      state: GameSessionState.lobby,
    }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));
    gameSessionRepository.save.mockResolvedValue(ok(undefined));
    gameConnection.broadcastToSession.mockReturnValue(ok(undefined));
  });

  it('returns a ValidationError if the topic name is invalid', async () => {
    const error = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'userId', name: '' })
    ).getError();

    expect(error).toMatchObject({ code: 'ValidationError', field: 'name' });
  });

  it('returns a DatabaseError error if finding the game session fails', async () => {
    gameSessionRepository.findById.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'userId', name: 'Some name' })
    ).getError();

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(error.code).toEqual('DatabaseError');
  });

  it('returns a GameSessionNotFoundError error if the game session could not be found', async () => {
    gameSessionRepository.findById.mockResolvedValue(ok(null));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'userId', name: 'Some name' })
    ).getError();

    expect(error.code).toBe('GameSessionNotFoundError');
  });

  it('returns a TopicAlreadyInGameSessionError error if the topic is already in the game session', async () => {
    const player = Player.create({ name: 'User', userId: 'userId' }).getData();
    const topic = GameTopic.create({ name: 'Some name' }).getData();
    const gameSession = GameSession.create({
      name: 'Test Session',
      players: [player],
      topics: [topic],
      state: GameSessionState.lobby,
    }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'userId', name: 'Some name' })
    ).getError();

    expect(error.code).toBe('TopicAlreadyInGameSessionError');
  });

  it('returns a GameSessionNotInLobbyError error if the game session is not in `lobby` state', async () => {
    const player = Player.create({ name: 'User', userId: 'userId' }).getData();
    const gameSession = GameSession.create({
      name: 'Test Session',
      players: [player],
      state: GameSessionState.matchInProgress,
    }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'userId', name: 'Some name' })
    ).getError();

    expect(error.code).toBe('GameSessionNotInLobbyError');
  });

  it('returns a DatabaseError error if the game session fails to be saved in the repository', async () => {
    gameSessionRepository.save.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'userId', name: 'Some name' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(error.code).toBe('DatabaseError');
  });

  it('returns a BroadcastToGameSessionError error if broadcasting to the game session fails', async () => {
    gameConnection.broadcastToSession.mockReturnValue(
      fail(new BroadcastToGameSessionError('Error'))
    );

    const error = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'userId', name: 'Some name' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameConnection.broadcastToSession).toHaveBeenCalledWith(gameSession.id, {
      type: 'TOPIC_ADDED',
      payload: {
        topic: expect.objectContaining({ name: 'Some name' }),
        gameSession: expect.objectContaining({ id: gameSession.id, name: 'Test Session' }),
      },
    });
    expect(error.code).toBe('BroadcastToGameSessionError');
  });

  it('returns the game session DTO with the added topic', async () => {
    const gameSessionDTO = (
      await useCase.execute({ sessionId: 'sessionId', userId: 'userId', name: 'Some name' })
    ).getData();

    expect(gameSessionDTO).toMatchObject({
      name: 'Test Session',
      topics: [{ name: 'Some name' }],
    });
    expect(gameSessionDTO).not.toBeInstanceOf(GameSession);
  });
});
