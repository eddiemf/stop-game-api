import {
  BroadcastToGameSessionError,
  DatabaseError,
  GameSession,
  type GameSessionRepository,
  GameSessionState,
  GameTopic,
  Player,
} from '@app/domain';
import type { GameConnection } from '@app/ports';
import { fail, ok } from '@shared/result';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { RemoveTopic } from './remove-topic';

describe('RemoveTopic', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameConnection = mock<GameConnection>();

  const useCase = new RemoveTopic(gameSessionRepository, gameConnection);

  beforeEach(() => {
    const player = Player.create({ userId: 'userId', name: 'Test Player' }).getData();
    const topic = GameTopic.create({ name: 'Test Topic' }).getData();
    const gameSession = GameSession.create({
      name: 'Test Session',
      topics: [topic],
      players: [player],
      state: GameSessionState.lobby,
    }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));
    gameSessionRepository.save.mockResolvedValue(ok(undefined));
    gameConnection.broadcastToSession.mockReturnValue(ok(undefined));
  });

  it('returns a DatabaseError if finding the game session fails', async () => {
    gameSessionRepository.findById.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', topicName: 'Test Topic', userId: 'userId' })
    ).getError();

    expect(error.code).toBe('DatabaseError');
    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
  });

  it('returns a GameSessionNotFoundError if the game session could not be found', async () => {
    gameSessionRepository.findById.mockResolvedValue(ok(null));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', topicName: 'Test Topic', userId: 'userId' })
    ).getError();

    expect(error.code).toBe('GameSessionNotFoundError');
  });

  it('returns a TopicNotFoundError if the topic could not be found', async () => {
    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        topicName: 'Another topic',
        userId: 'userId',
      })
    ).getError();

    expect(error.code).toBe('TopicNotFoundError');
  });

  it('returns a GameSessionNotInLobbyError if the game session is not in the lobby', async () => {
    const player = Player.create({ userId: 'userId', name: 'Test Player' }).getData();
    const topic = GameTopic.create({ name: 'Test Topic' }).getData();
    const gameSession = GameSession.create({
      name: 'Test Session',
      topics: [topic],
      players: [player],
      state: GameSessionState.matchInProgress,
    }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', topicName: 'Test Topic', userId: 'userId' })
    ).getError();

    expect(error.code).toBe('GameSessionNotInLobbyError');
  });

  it('returns a DatabaseError error if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({ sessionId: 'sessionId', topicName: 'Test Topic', userId: 'userId' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(error.code).toBe('DatabaseError');
  });

  it('returns a BroadcastToGameSessionError if broadcasting to the session fails', async () => {
    gameConnection.broadcastToSession.mockReturnValue(
      fail(new BroadcastToGameSessionError('Error'))
    );

    const error = (
      await useCase.execute({ sessionId: 'sessionId', topicName: 'Test Topic', userId: 'userId' })
    ).getError();

    const gameSession = gameSessionRepository.findById.mock.settledResults[0].value.data;
    expect(error.code).toBe('BroadcastToGameSessionError');
    expect(gameConnection.broadcastToSession).toHaveBeenCalledWith('sessionId', {
      type: 'TOPIC_REMOVED',
      payload: {
        gameSession: expect.objectContaining({
          id: gameSession.id,
          name: 'Test Session',
        }),
        topic: expect.objectContaining({
          name: 'Test Topic',
        }),
      },
    });
  });

  it('removes the topic from the game session and broadcasts the change', async () => {
    const result = (
      await useCase.execute({ sessionId: 'sessionId', topicName: 'Test Topic', userId: 'userId' })
    ).getData();

    expect(result).toBeUndefined();
  });
});
