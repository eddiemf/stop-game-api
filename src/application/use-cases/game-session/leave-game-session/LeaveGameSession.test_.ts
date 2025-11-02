import pubsub from 'pubsub-js';
import {
  DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  PLAYER_NOT_IN_SESSION,
} from '../../../../interfaces';
import { Error, Ok } from '../../../../shared/result';
import { getMockedGameSession } from '../../../__mocks__/entities/GameSession.mock';
import { getMockedGameSessionRepository } from '../../../__mocks__/repositories/GameSessionRepository.mock';
import { PLAYER_DISCONNECTED_EVENT } from '../../../message-bus';
import { FindGameSession } from '../find-game-session';
import { LeaveGameSession } from './leave-game-session';

jest.mock('pubsub-js');
jest.mock('../find-game-session');

describe('LeaveGameSession', () => {
  const gameSessionRepository = getMockedGameSessionRepository();
  const mockedFindGameSession = jest.mocked(FindGameSession);
  const mockedGameSession = getMockedGameSession();
  const mockedPublish = jest.mocked(pubsub.publish);

  beforeEach(() => {
    mockedFindGameSession.execute.mockResolvedValue(Ok(mockedGameSession));
    mockedGameSession.disconnectPlayer.mockReturnValue(Ok(undefined));
    gameSessionRepository.save.mockResolvedValue(Ok(mockedGameSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a DATABASE_ERROR error if finding the game session fails', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await LeaveGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerId: 'playerId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(mockedFindGameSession.execute).toHaveBeenCalledWith({
      gameSessionRepository,
      id: 'sessionId',
    });
  });

  it('returns a GAME_SESSION_NOT_FOUND error if the game session could not be found', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Ok(null));

    const result = await LeaveGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerId: 'playerId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_FOUND);
  });

  it('returns a PLAYER_NOT_IN_SESSION error if the player is not in the game session', async () => {
    mockedGameSession.disconnectPlayer.mockReturnValue(Error(PLAYER_NOT_IN_SESSION));

    const result = await LeaveGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerId: 'playerId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(PLAYER_NOT_IN_SESSION);
  });

  it('returns a DATABASE_ERROR error if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await LeaveGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerId: 'playerId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
  });

  it('broadcasts the game session with the disconnected player', async () => {
    const result = await LeaveGameSession.execute({
      gameSessionRepository,
      sessionId: 'sessionId',
      playerId: 'playerId',
    });
    if (!result.isOk) fail('Expected success');

    expect(result.data).toBeUndefined();
    expect(mockedGameSession.disconnectPlayer).toHaveBeenCalledWith('playerId');
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
    expect(mockedPublish).toHaveBeenCalledWith(PLAYER_DISCONNECTED_EVENT, mockedGameSession);
  });
});
