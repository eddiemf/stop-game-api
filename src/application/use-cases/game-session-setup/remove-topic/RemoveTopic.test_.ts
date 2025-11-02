import pubsub from 'pubsub-js';
import {
  DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  GAME_SESSION_NOT_IN_LOBBY,
  TOPIC_NOT_FOUND,
} from '../../../../interfaces';
import { Error, Ok } from '../../../../shared/result';
import { getMockedGameSession } from '../../../__mocks__/entities/GameSession.mock';
import { getMockedGameSessionRepository } from '../../../__mocks__/repositories/GameSessionRepository.mock';
import { TOPIC_REMOVED_EVENT } from '../../../message-bus';
import { FindGameSession } from '../find-game-session';
import { RemoveTopic } from './remove-topic';

jest.mock('pubsub-js');
jest.mock('../find-game-session');

describe('RemoveTopic', () => {
  const gameSessionRepository = getMockedGameSessionRepository();
  const mockedFindGameSession = jest.mocked(FindGameSession);
  const mockedGameSession = getMockedGameSession();
  const mockedPublish = jest.mocked(pubsub.publish);

  beforeEach(() => {
    mockedFindGameSession.execute.mockResolvedValue(Ok(mockedGameSession));
    mockedGameSession.removeTopic.mockReturnValue(Ok(undefined));
    gameSessionRepository.save.mockResolvedValue(Ok(mockedGameSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a DATABASE_ERROR error if finding the game session fails', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await RemoveTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(mockedFindGameSession.execute).toHaveBeenCalledWith({
      gameSessionRepository,
      id: 'gameSessionId',
    });
  });

  it('returns a GAME_SESSION_NOT_FOUND error if the game session could not be found', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Ok(null));

    const result = await RemoveTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_FOUND);
  });

  it('returns a TOPIC_NOT_FOUND error if the topic could not be found', async () => {
    mockedGameSession.removeTopic.mockReturnValue(Error(TOPIC_NOT_FOUND));

    const result = await RemoveTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(TOPIC_NOT_FOUND);
  });

  it('returns a GAME_SESSION_NOT_IN_LOBBY error if the game session is not in the lobby', async () => {
    mockedGameSession.removeTopic.mockReturnValue(Error(GAME_SESSION_NOT_IN_LOBBY));

    const result = await RemoveTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_IN_LOBBY);
  });

  it('returns a DATABASE_ERROR error if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await RemoveTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
  });

  it('returns and broadcasts the game session with the removed topic', async () => {
    const result = await RemoveTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
    });
    if (!result.isOk) fail('Expected a result');

    expect(result.data).toBe(mockedGameSession);
    expect(mockedGameSession.removeTopic).toHaveBeenCalledWith('topicId');
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
    expect(mockedPublish).toHaveBeenCalledWith(TOPIC_REMOVED_EVENT, mockedGameSession);
  });
});
