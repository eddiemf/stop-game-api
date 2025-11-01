import pubsub from 'pubsub-js';
import {
  DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  GAME_SESSION_NOT_IN_LOBBY,
  IGameSessionState,
  INVALID_INPUT,
  TOPIC_ALREADY_IN_GAME_SESSION,
} from '../../../../interfaces';
import { Error, Ok } from '../../../../shared/result';
import { getMockedGameSession } from '../../../__mocks__/entities/GameSession.mock';
import { getMockedGameSessionRepository } from '../../../__mocks__/repositories/GameSessionRepository.mock';
import { TOPIC_ADDED_EVENT } from '../../../message-bus';
import { FindGameSession } from '../find-game-session';
import { AddTopic } from './AddTopic';

jest.mock('pubsub-js');
jest.mock('../find-game-session');

describe('AddTopic', () => {
  const gameSessionRepository = getMockedGameSessionRepository();
  const mockedFindGameSession = jest.mocked(FindGameSession);
  const mockedGameSession = getMockedGameSession();
  const mockedPublish = jest.mocked(pubsub.publish);

  beforeEach(() => {
    mockedFindGameSession.execute.mockResolvedValue(Ok(mockedGameSession));
    mockedGameSession.addTopic.mockReturnValue(Ok(undefined));
    gameSessionRepository.save.mockResolvedValue(Ok(mockedGameSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an INVALID_INPUT error if the topic is invalid', async () => {
    const result = await AddTopic.execute({
      gameSessionRepository,
      sessionId: '1',
      name: 'a',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(INVALID_INPUT);
  });

  it('returns a DATABASE_ERROR error if finding the game session fails', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await AddTopic.execute({
      gameSessionRepository,
      sessionId: '1',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(mockedFindGameSession.execute).toHaveBeenCalledWith({
      gameSessionRepository,
      id: '1',
    });
  });

  it('returns a GAME_SESSION_NOT_FOUND error if the game session could not be found', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Ok(null));

    const result = await AddTopic.execute({
      gameSessionRepository,
      sessionId: '1',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_FOUND);
    expect(mockedFindGameSession.execute).toHaveBeenCalledWith({
      gameSessionRepository,
      id: '1',
    });
  });

  it('returns a TOPIC_ALREADY_IN_GAME_SESSION error if the topic is already in the game session', async () => {
    mockedGameSession.addTopic.mockReturnValue(Error(TOPIC_ALREADY_IN_GAME_SESSION));

    const result = await AddTopic.execute({
      gameSessionRepository,
      sessionId: '1',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(TOPIC_ALREADY_IN_GAME_SESSION);
    expect(mockedGameSession.addTopic).toHaveBeenCalled();
  });

  it('returns a GAME_SESSION_NOT_IN_LOBBY error if the game session is not in `lobby` state', async () => {
    mockedFindGameSession.execute.mockResolvedValue(
      Ok({ ...mockedGameSession, state: IGameSessionState.matchInProgress })
    );
    mockedGameSession.addTopic.mockReturnValue(Error(GAME_SESSION_NOT_IN_LOBBY));

    const result = await AddTopic.execute({
      gameSessionRepository,
      sessionId: '1',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_IN_LOBBY);
    expect(mockedGameSession.addTopic).toHaveBeenCalled();
  });

  it('returns a DATABASE_ERROR error if the game session fails to be saved in the repository', async () => {
    gameSessionRepository.save.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await AddTopic.execute({
      gameSessionRepository,
      sessionId: '1',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
    expect(result.error).toBe(DATABASE_ERROR);
  });

  it('broadcasts and returns the game session with the added topic', async () => {
    const result = await AddTopic.execute({
      gameSessionRepository,
      sessionId: '1',
      name: 'Some name',
    });
    if (!result.isOk) fail('Expected a success result');

    expect(mockedPublish).toHaveBeenCalledWith(TOPIC_ADDED_EVENT, mockedGameSession);
    expect(result.data).toBe(mockedGameSession);
  });
});
