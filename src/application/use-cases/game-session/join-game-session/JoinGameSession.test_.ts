import pubsub from 'pubsub-js';
import {
  DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  INVALID_INPUT,
  PLAYER_ALREADY_IN_GAME_SESSION,
} from '../../../../interfaces';
import { Error, Ok } from '../../../../shared/result';
import { getMockedGameSession } from '../../../__mocks__/entities/GameSession.mock';
import { getMockedGameSessionRepository } from '../../../__mocks__/repositories/GameSessionRepository.mock';
import { PLAYER_JOINED_EVENT } from '../../../message-bus';
import { FindGameSession } from '../find-game-session';
import { JoinGameSession } from './join-game-session';

jest.mock('pubsub-js');
jest.mock('../find-game-session');

describe('JoinGameSession', () => {
  const gameSessionRepository = getMockedGameSessionRepository();
  const mockedFindGameSession = jest.mocked(FindGameSession);
  const mockedGameSession = getMockedGameSession();
  const mockedPublish = jest.mocked(pubsub.publish);

  beforeEach(() => {
    gameSessionRepository.save.mockResolvedValue(Ok(undefined));
    mockedFindGameSession.execute.mockResolvedValue(Ok(mockedGameSession));
    mockedGameSession.addPlayer.mockReturnValue(Ok(undefined));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an INVALID_INPUT error if the player is invalid', async () => {
    const result = await JoinGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerName: 'a',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(INVALID_INPUT);
  });

  it('returns a DATABASE_ERROR error if finding the game session fails', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await JoinGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerName: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(FindGameSession.execute).toHaveBeenCalledWith({
      gameSessionRepository,
      id: 'sessionId',
    });
  });

  it('returns a GAME_SESSION_NOT_FOUND error if the game session could not be found', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Ok(null));

    const result = await JoinGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerName: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_FOUND);
  });

  it('returns a PLAYER_ALREADY_IN_GAME_SESSION error if the player is already in the game session', async () => {
    mockedGameSession.addPlayer.mockReturnValue(Error(PLAYER_ALREADY_IN_GAME_SESSION));

    const result = await JoinGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerName: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(PLAYER_ALREADY_IN_GAME_SESSION);
    expect(mockedGameSession.addPlayer).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Some name' })
    );
  });

  it('returns a DATABASE_ERROR error if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await JoinGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerName: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
  });

  it('broadcasts the game session with the added player and returns the player id', async () => {
    const result = await JoinGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerName: 'Some name',
    });
    if (!result.isOk) fail('Expected success');

    expect(mockedGameSession.addPlayer).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Some name' })
    );
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
    expect(result.data).toBe(mockedGameSession.addPlayer.mock.calls[0][0].id);
    expect(mockedPublish).toHaveBeenCalledWith(PLAYER_JOINED_EVENT, mockedGameSession);
  });
});
