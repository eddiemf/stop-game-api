import { getMockedGameSession } from '../../../../application/__mocks__/entities/GameSession.mock';
import { AddTopic, RemoveTopic, RenameTopic } from '../../../../application/use-cases';
import {
  DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  GAME_SESSION_NOT_IN_LOBBY,
  INVALID_INPUT,
  TOPIC_ALREADY_IN_GAME_SESSION,
  TOPIC_NOT_FOUND,
} from '../../../../interfaces';
import { Error, Ok } from '../../../../shared/result';
import { GameTopicsController } from './game-topics-controller';

jest.mock('../../../application/use-cases');

describe('GameTopicsController', () => {
  const mockedAddTopic = jest.mocked(AddTopic);
  const mockedRemoveTopic = jest.mocked(RemoveTopic);
  const mockedRenameTopic = jest.mocked(RenameTopic);
  const mockedGameSession = getMockedGameSession();

  beforeEach(() => {
    mockedAddTopic.execute.mockResolvedValue(Ok(mockedGameSession));
    mockedRemoveTopic.execute.mockResolvedValue(Ok(mockedGameSession));
    mockedRenameTopic.execute.mockResolvedValue(Ok(mockedGameSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('returns a 200 status with an INVALID_INPUT error if adding the topic fails due to invalid input', async () => {
      mockedAddTopic.execute.mockResolvedValue(Error(INVALID_INPUT));

      const result = await GameTopicsController.add({
        params: { gameSessionId: 'sessionId' },
        body: { name: 'Some name' },
        query: {},
      });

      expect(result).toEqual({ status: 200, response: { error: INVALID_INPUT } });
      expect(mockedAddTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        name: 'Some name',
      });
    });

    it('returns a 200 status with a GAME_SESSION_NOT_FOUND error if the app returns a session not found error', async () => {
      mockedAddTopic.execute.mockResolvedValue(Error(GAME_SESSION_NOT_FOUND));

      const result = await GameTopicsController.add({
        params: { gameSessionId: 'sessionId' },
        body: { name: 'Some name' },
        query: {},
      });

      expect(result).toEqual({ status: 200, response: { error: GAME_SESSION_NOT_FOUND } });
      expect(mockedAddTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        name: 'Some name',
      });
    });

    it('returns a 200 status with a TOPIC_ALREADY_IN_GAME_SESSION error if the app returns a topic already in session error', async () => {
      mockedAddTopic.execute.mockResolvedValue(Error(TOPIC_ALREADY_IN_GAME_SESSION));

      const result = await GameTopicsController.add({
        params: { gameSessionId: 'sessionId' },
        body: { name: 'Some name' },
        query: {},
      });

      expect(result).toEqual({ status: 200, response: { error: TOPIC_ALREADY_IN_GAME_SESSION } });
      expect(mockedAddTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        name: 'Some name',
      });
    });

    it('returns a 500 status with a DATABASE_ERROR error if adding the topic fails due to database', async () => {
      mockedAddTopic.execute.mockResolvedValue(Error(DATABASE_ERROR));

      const result = await GameTopicsController.add({
        params: { gameSessionId: 'sessionId' },
        body: { name: 'Some name' },
        query: {},
      });

      expect(result).toEqual({ status: 500, response: { error: DATABASE_ERROR } });
      expect(mockedAddTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        name: 'Some name',
      });
    });

    it('returns a 200 status with the game session if the topic is added successfully', async () => {
      const result = await GameTopicsController.add({
        params: { gameSessionId: 'sessionId' },
        body: { name: 'Some name' },
        query: {},
      });

      expect(result).toEqual({
        status: 200,
        response: {
          gameSession: {
            id: mockedGameSession.id,
            name: mockedGameSession.name,
            topics: mockedGameSession.topics,
            players: mockedGameSession.players,
            state: mockedGameSession.state,
          },
        },
      });
      expect(mockedAddTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        name: 'Some name',
      });
    });
  });

  describe('remove', () => {
    it('returns a 200 status with a GAME_SESSION_NOT_IN_LOBBY error if the app returns a game session not in lobby error', async () => {
      mockedRemoveTopic.execute.mockResolvedValue(Error(GAME_SESSION_NOT_IN_LOBBY));

      const result = await GameTopicsController.remove({
        params: { gameSessionId: 'sessionId' },
        body: {},
        query: { topicId: 'topicId' },
      });

      expect(result).toEqual({ status: 200, response: { error: GAME_SESSION_NOT_IN_LOBBY } });
      expect(mockedRemoveTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
      });
    });

    it('returns a 200 status with a TOPIC_NOT_FOUND error if the app returns a topic not found error', async () => {
      mockedRemoveTopic.execute.mockResolvedValue(Error(TOPIC_NOT_FOUND));

      const result = await GameTopicsController.remove({
        params: { gameSessionId: 'sessionId' },
        body: {},
        query: { topicId: 'topicId' },
      });

      expect(result).toEqual({ status: 200, response: { error: TOPIC_NOT_FOUND } });
      expect(mockedRemoveTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
      });
    });

    it('returns a 200 status with a GAME_SESSION_NOT_FOUND error if the app returns a game session not found error', async () => {
      mockedRemoveTopic.execute.mockResolvedValue(Error(GAME_SESSION_NOT_FOUND));

      const result = await GameTopicsController.remove({
        params: { gameSessionId: 'sessionId' },
        body: {},
        query: { topicId: 'topicId' },
      });

      expect(result).toEqual({ status: 200, response: { error: GAME_SESSION_NOT_FOUND } });
      expect(mockedRemoveTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
      });
    });

    it('returns a 200 status with a DATABASE_ERROR error if removing the topic fails due to database', async () => {
      mockedRemoveTopic.execute.mockResolvedValue(Error(DATABASE_ERROR));

      const result = await GameTopicsController.remove({
        params: { gameSessionId: 'sessionId' },
        body: {},
        query: { topicId: 'topicId' },
      });

      expect(result).toEqual({ status: 500, response: { error: DATABASE_ERROR } });
      expect(mockedRemoveTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
      });
    });

    it('returns a 200 status with the game session if the topic is removed successfully', async () => {
      const result = await GameTopicsController.remove({
        params: { gameSessionId: 'sessionId' },
        body: {},
        query: { topicId: 'topicId' },
      });

      expect(result).toEqual({
        status: 200,
        response: {
          gameSession: {
            id: mockedGameSession.id,
            name: mockedGameSession.name,
            topics: mockedGameSession.topics,
            players: mockedGameSession.players,
            state: mockedGameSession.state,
          },
        },
      });
      expect(mockedRemoveTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
      });
    });
  });

  describe('rename', () => {
    it('returns a 200 status with a INVALID_INPUT error if the app returns an invalid input error', async () => {
      mockedRenameTopic.execute.mockResolvedValue(Error(INVALID_INPUT));

      const result = await GameTopicsController.rename({
        params: { gameSessionId: 'sessionId' },
        body: { topicId: 'topicId', name: 'New name' },
        query: {},
      });

      expect(result).toEqual({ status: 200, response: { error: INVALID_INPUT } });
      expect(mockedRenameTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
        name: 'New name',
      });
    });

    it('returns a 200 status with a GAME_SESSION_NOT_FOUND error if the app returns a game session not found error', async () => {
      mockedRenameTopic.execute.mockResolvedValue(Error(GAME_SESSION_NOT_FOUND));

      const result = await GameTopicsController.rename({
        params: { gameSessionId: 'sessionId' },
        body: { topicId: 'topicId', name: 'New name' },
        query: {},
      });

      expect(result).toEqual({ status: 200, response: { error: GAME_SESSION_NOT_FOUND } });
      expect(mockedRenameTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
        name: 'New name',
      });
    });

    it('returns a 200 status with a GAME_SESSION_NOT_IN_LOBBY error if the app returns a game session not in lobby error', async () => {
      mockedRenameTopic.execute.mockResolvedValue(Error(GAME_SESSION_NOT_IN_LOBBY));

      const result = await GameTopicsController.rename({
        params: { gameSessionId: 'sessionId' },
        body: { topicId: 'topicId', name: 'New name' },
        query: {},
      });

      expect(result).toEqual({ status: 200, response: { error: GAME_SESSION_NOT_IN_LOBBY } });
      expect(mockedRenameTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
        name: 'New name',
      });
    });

    it('returns a 200 status with a TOPIC_NOT_FOUND error if the app returns a topic not found error', async () => {
      mockedRenameTopic.execute.mockResolvedValue(Error(TOPIC_NOT_FOUND));

      const result = await GameTopicsController.rename({
        params: { gameSessionId: 'sessionId' },
        body: { topicId: 'topicId', name: 'New name' },
        query: {},
      });

      expect(result).toEqual({ status: 200, response: { error: TOPIC_NOT_FOUND } });
      expect(mockedRenameTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
        name: 'New name',
      });
    });

    it('returns a 500 status with a DATABASE_ERROR error if renaming the topic fails due to database', async () => {
      mockedRenameTopic.execute.mockResolvedValue(Error(DATABASE_ERROR));

      const result = await GameTopicsController.rename({
        params: { gameSessionId: 'sessionId' },
        body: { topicId: 'topicId', name: 'New name' },
        query: {},
      });

      expect(result).toEqual({ status: 500, response: { error: DATABASE_ERROR } });
      expect(mockedRenameTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
        name: 'New name',
      });
    });

    it('returns a 200 status with the game session if the topic is renamed successfully', async () => {
      const result = await GameTopicsController.rename({
        params: { gameSessionId: 'sessionId' },
        body: { topicId: 'topicId', name: 'New name' },
        query: {},
      });

      expect(result).toEqual({
        status: 200,
        response: {
          gameSession: {
            id: mockedGameSession.id,
            name: mockedGameSession.name,
            topics: mockedGameSession.topics,
            players: mockedGameSession.players,
            state: mockedGameSession.state,
          },
        },
      });
      expect(mockedRenameTopic.execute).toHaveBeenCalledWith({
        gameSessionRepository: expect.anything(),
        gameSessionId: 'sessionId',
        topicId: 'topicId',
        name: 'New name',
      });
    });
  });
});
