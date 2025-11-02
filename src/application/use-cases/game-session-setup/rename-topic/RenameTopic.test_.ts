import pubsub from 'pubsub-js';
import {
  DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  GAME_SESSION_NOT_IN_LOBBY,
  INVALID_INPUT,
  TOPIC_NOT_FOUND,
} from '../../../../interfaces';
import { Error, Ok } from '../../../../shared/result';
import { getMockedGameSession } from '../../../__mocks__/entities/GameSession.mock';
import { getMockedGameSessionRepository } from '../../../__mocks__/repositories/GameSessionRepository.mock';
import { TOPIC_RENAMED_EVENT } from '../../../message-bus';
import { FindGameSession } from '../find-game-session';
import { RenameTopic } from './rename-topic';

jest.mock('pubsub-js');
jest.mock('../find-game-session');

describe('RenameTopic', () => {
  const gameSessionRepository = getMockedGameSessionRepository();
  const mockedFindGameSession = jest.mocked(FindGameSession);
  const mockedGameSession = getMockedGameSession();
  const mockedPublish = jest.mocked(pubsub.publish);

  beforeEach(() => {
    mockedFindGameSession.execute.mockResolvedValue(Ok(mockedGameSession));
    mockedGameSession.renameTopic.mockReturnValue(Ok(undefined));
    gameSessionRepository.save.mockResolvedValue(Ok(mockedGameSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a DATABASE_ERROR error if finding the game session fails', async () => {
    mockedFindGameSession.execute.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await RenameTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
      name: 'Some name',
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

    const result = await RenameTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_FOUND);
    expect(mockedFindGameSession.execute).toHaveBeenCalledWith({
      gameSessionRepository,
      id: 'gameSessionId',
    });
  });

  it('returns an INVALID_INPUT error if the name is invalid', async () => {
    mockedGameSession.renameTopic.mockReturnValue(Error(INVALID_INPUT));

    const result = await RenameTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
      name: 'Invalid name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(INVALID_INPUT);
    expect(mockedGameSession.renameTopic).toHaveBeenCalledWith('topicId', 'Invalid name');
  });

  it('returns a GAME_SESSION_NOT_IN_LOBBY error if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(Error(GAME_SESSION_NOT_IN_LOBBY));

    const result = await RenameTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_IN_LOBBY);
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
  });

  it('returns a TOPIC_NOT_FOUND error if the topic could not be found', async () => {
    mockedGameSession.renameTopic.mockReturnValue(Error(TOPIC_NOT_FOUND));

    const result = await RenameTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(TOPIC_NOT_FOUND);
    expect(mockedGameSession.renameTopic).toHaveBeenCalledWith('topicId', 'Some name');
  });

  it('returns a DATABASE_ERROR error if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await RenameTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
  });

  it('broadcasts and returns the session with the renamed topic', async () => {
    const result = await RenameTopic.execute({
      gameSessionRepository,
      sessionId: 'gameSessionId',
      topicId: 'topicId',
      name: 'Some name',
    });
    if (!result.isOk) fail('Expected success');

    expect(result.data).toBe(mockedGameSession);
    expect(mockedGameSession.renameTopic).toHaveBeenCalledWith('topicId', 'Some name');
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
    expect(mockedPublish).toHaveBeenCalledWith(TOPIC_RENAMED_EVENT, mockedGameSession);
  });
});
