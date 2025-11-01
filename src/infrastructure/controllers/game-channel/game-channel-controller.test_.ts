import { getMockedGameSession } from '../../../../application/__mocks__/entities/GameSession.mock';
import { CreateGameSession, JoinGameSession } from '../../../../application/use-cases';
import {
  DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  INVALID_INPUT,
  PLAYER_ALREADY_IN_GAME_SESSION,
} from '../../../../interfaces';
import { Error, Ok } from '../../../../shared/result';
import { GameConnection } from '../../game-connection';
import { GameChannelController } from './game-channel-controller';

jest.mock('../../../application/use-cases');
jest.mock('../../game-connection');

describe('GameChannelController', () => {
  const mockedGameSession = getMockedGameSession();
  const mockedJoinGameSession = jest.mocked(JoinGameSession);
  const mockedCreateGameSession = jest.mocked(CreateGameSession);
  const mockedCreateGameChannel = jest.mocked(GameConnection.createGameChannel);
  const mockedJoinGameChannel = jest.mocked(GameConnection.joinGameChannel);

  beforeEach(() => {
    mockedJoinGameSession.execute.mockResolvedValue(Ok('playerId'));
    mockedCreateGameSession.execute.mockResolvedValue(Ok(mockedGameSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('returns a 500 status with a DATABASE_ERROR error if creating the game session fails due to database', async () => {
      mockedCreateGameSession.execute.mockResolvedValue(Error(DATABASE_ERROR));

      const result = await GameChannelController.create({
        params: {},
        body: { name: 'Some name' },
        query: {},
      });

      expect(result).toEqual({ status: 500, response: { error: DATABASE_ERROR } });
      expect(mockedCreateGameSession.execute).toHaveBeenCalledWith({
        name: 'Some name',
        gameSessionRepository: expect.anything(),
      });
    });

    it('returns a 200 status with an INVALID_INPUT error if creating the game session fails due to invalid input', async () => {
      mockedCreateGameSession.execute.mockResolvedValue(Error(INVALID_INPUT));

      const result = await GameChannelController.create({
        params: {},
        body: { name: 'Some name' },
        query: {},
      });

      expect(result).toEqual({ status: 200, response: { error: INVALID_INPUT } });
      expect(mockedCreateGameSession.execute).toHaveBeenCalledWith({
        name: 'Some name',
        gameSessionRepository: expect.anything(),
      });
    });

    it('returns a 200 status with the game session and creates a game channel', async () => {
      const result = await GameChannelController.create({
        params: {},
        body: { name: 'Some name' },
        query: {},
      });

      expect(mockedCreateGameSession.execute).toHaveBeenCalledWith({
        name: 'Some name',
        gameSessionRepository: expect.anything(),
      });
      expect(mockedCreateGameChannel).toHaveBeenCalledWith(mockedGameSession.id);
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
    });
  });

  describe('join', () => {
    it('returns a 200 status with an INVALID_INPUT error if the app returns an input error', async () => {
      mockedJoinGameSession.execute.mockResolvedValue(Error(INVALID_INPUT));

      const result = await GameChannelController.join({
        params: { sessionId: 'sessionId' },
        body: {},
        query: { playerName: 'Player' },
      });

      expect(result).toEqual({ status: 200, response: { error: INVALID_INPUT } });
      expect(mockedJoinGameSession.execute).toHaveBeenCalledWith({
        sessionId: 'sessionId',
        playerName: 'Player',
        gameSessionRepository: expect.anything(),
      });
    });

    it('returns a 200 status with a GAME_SESSION_NOT_FOUND error if the app returns a session not found error', async () => {
      mockedJoinGameSession.execute.mockResolvedValue(Error(GAME_SESSION_NOT_FOUND));

      const result = await GameChannelController.join({
        params: { sessionId: 'sessionId' },
        body: {},
        query: { playerName: 'Player' },
      });

      expect(result).toEqual({ status: 200, response: { error: GAME_SESSION_NOT_FOUND } });
      expect(mockedJoinGameSession.execute).toHaveBeenCalledWith({
        sessionId: 'sessionId',
        playerName: 'Player',
        gameSessionRepository: expect.anything(),
      });
    });

    it('returns a 200 status with a PLAYER_ALREADY_IN_GAME_SESSION error if the app returns a player already in session error', async () => {
      mockedJoinGameSession.execute.mockResolvedValue(Error(PLAYER_ALREADY_IN_GAME_SESSION));

      const result = await GameChannelController.join({
        params: { sessionId: 'sessionId' },
        body: {},
        query: { playerName: 'Player' },
      });

      expect(result).toEqual({ status: 200, response: { error: PLAYER_ALREADY_IN_GAME_SESSION } });
      expect(mockedJoinGameSession.execute).toHaveBeenCalledWith({
        sessionId: 'sessionId',
        playerName: 'Player',
        gameSessionRepository: expect.anything(),
      });
    });

    it('returns a 500 status with a DATABASE_ERROR error if the app returns a database error', async () => {
      mockedJoinGameSession.execute.mockResolvedValue(Error(DATABASE_ERROR));

      const result = await GameChannelController.join({
        params: { sessionId: 'sessionId' },
        body: {},
        query: { playerName: 'Player' },
      });

      expect(result).toEqual({ status: 500, response: { error: DATABASE_ERROR } });
      expect(mockedJoinGameSession.execute).toHaveBeenCalledWith({
        sessionId: 'sessionId',
        playerName: 'Player',
        gameSessionRepository: expect.anything(),
      });
    });

    it('returns a callback function that joins the game channel', async () => {
      const result = await GameChannelController.join({
        params: { sessionId: 'sessionId' },
        body: {},
        query: { playerName: 'Player' },
      });

      expect(mockedJoinGameSession.execute).toHaveBeenCalledWith({
        sessionId: 'sessionId',
        playerName: 'Player',
        gameSessionRepository: expect.anything(),
      });

      if (typeof result !== 'function') fail('Expected result to be a function');
      // @ts-expect-error
      result('reqMock', 'resMock');

      expect(mockedJoinGameChannel).toHaveBeenCalledWith(
        'reqMock',
        'resMock',
        'sessionId',
        'playerId'
      );
    });
  });
});
