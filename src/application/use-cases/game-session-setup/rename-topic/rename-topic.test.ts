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
import { RenameTopic } from './rename-topic';

describe('RenameTopic', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameConnection = mock<GameConnection>();

  const useCase = new RenameTopic(gameSessionRepository, gameConnection);

  beforeEach(() => {
    const player = Player.create({ userId: 'userId', name: 'Player name' }).getData();
    const topic = GameTopic.create({ id: 'topicId', name: 'Old name' }).getData();
    const gameSession = GameSession.create({
      name: 'Test session',
      players: [player],
      topics: [topic],
      state: GameSessionState.lobby,
    }).getData();
    gameSessionRepository.findById.mockResolvedValue(ok(gameSession));
    gameSessionRepository.save.mockResolvedValue(ok(undefined));
    gameConnection.broadcastToSession.mockReturnValue(ok(undefined));
  });

  it('returns a DatabaseError if finding the game session fails', async () => {
    gameSessionRepository.findById.mockResolvedValueOnce(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'topicId',
        newName: 'New Name',
      })
    ).getError();

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(error.code).toBe('DatabaseError');
  });

  it('returns a GameSessionNotFoundError if the game session could not be found', async () => {
    gameSessionRepository.findById.mockResolvedValueOnce(ok(null));

    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'topicId',
        newName: 'New name',
      })
    ).getError();

    expect(error.code).toBe('GameSessionNotFoundError');
  });

  it('returns a ValidationError if the name is invalid', async () => {
    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'topicId',
        newName: '',
      })
    ).getError();

    expect(error.code).toBe('ValidationError');
  });

  it('returns a GameSessionNotInLobbyError if the game session is not in lobby state', async () => {
    const player = Player.create({ userId: 'userId', name: 'Player name' }).getData();
    const topic = GameTopic.create({ id: 'topicId', name: 'Old name' }).getData();
    const gameSession = GameSession.create({
      name: 'Test session',
      players: [player],
      topics: [topic],
      state: GameSessionState.matchInProgress,
    }).getData();
    gameSessionRepository.findById.mockResolvedValueOnce(ok(gameSession));

    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'topicId',
        newName: 'New name',
      })
    ).getError();

    expect(error.code).toBe('GameSessionNotInLobbyError');
  });

  it('returns a TopicNotFoundError if the topic could not be found', async () => {
    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'not-found-id',
        newName: 'New name',
      })
    ).getError();

    expect(error.code).toBe('TopicNotFoundError');
  });

  it('returns a TopicNameAlreadyInSessionError if the new name is already used in the session', async () => {
    const player = Player.create({ userId: 'userId', name: 'Player name' }).getData();
    const topic1 = GameTopic.create({ id: 'topicId1', name: 'Topic 1' }).getData();
    const topic2 = GameTopic.create({ id: 'topicId2', name: 'Topic 2' }).getData();
    const gameSession = GameSession.create({
      name: 'Test session',
      players: [player],
      topics: [topic1, topic2],
      state: GameSessionState.lobby,
    }).getData();
    gameSessionRepository.findById.mockResolvedValueOnce(ok(gameSession));

    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'topicId1',
        newName: 'Topic 2',
      })
    ).getError();

    expect(error.code).toBe('TopicNameAlreadyInSessionError');
  });

  it('returns a UserNotInGameSessionError if the user is not in the game session', async () => {
    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'not-in-session',
        topicId: 'topicId',
        newName: 'New name',
      })
    ).getError();

    expect(error.code).toBe('UserNotInGameSessionError');
  });

  it('returns a DatabaseError if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(fail(new DatabaseError('Error')));

    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'topicId',
        newName: 'New name',
      })
    ).getError();

    expect(error.code).toBe('DatabaseError');
  });

  it('returns a BroadcastToGameSessionError if broadcasting to the session fails', async () => {
    gameConnection.broadcastToSession.mockReturnValueOnce(
      fail(new BroadcastToGameSessionError('Error'))
    );

    const error = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'topicId',
        newName: 'New name',
      })
    ).getError();

    expect(error.code).toBe('BroadcastToGameSessionError');
  });

  it('renames the topic successfully', async () => {
    const result = (
      await useCase.execute({
        sessionId: 'sessionId',
        userId: 'userId',
        topicId: 'topicId',
        newName: 'New name',
      })
    ).getData();

    expect(result).toBeUndefined();
  });
});
