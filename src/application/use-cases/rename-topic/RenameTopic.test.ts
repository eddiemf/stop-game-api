import { genericErrors, inputErrors, INPUT_ERROR, VALIDATION_ERROR } from '../../constants';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildRenameTopic } from './RenameTopic';

describe('AddTopic', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    makeGameSession: jest.fn(),
  };

  const renameTopic = buildRenameTopic(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.save.mockResolvedValue(true);
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session');
    dependencies.makeGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
    fakeGameSession.getPlayers.mockReturnValue('mocked players');
    fakeGameSession.renameTopic.mockReturnValue(undefined);
  });

  it('searches for the given game session hash in the repository', async () => {
    await renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' });
    expect(dependencies.gameSessionRepository.findByHash).toBeCalledWith('1');
  });

  it('throws an internal error if the search for the game session throws', async () => {
    dependencies.gameSessionRepository.findByHash.mockRejectedValue('some error');
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(genericErrors.INTERNAL_ERROR);
  });

  it('throws an input error if the game session could not be found', async () => {
    dependencies.gameSessionRepository.findByHash.mockResolvedValue(null);
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(inputErrors.GAME_SESSION_NOT_FOUND);
  });

  it('creates a game session entity with the found game session data', async () => {
    await renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' });
    expect(dependencies.makeGameSession).toBeCalledWith('mocked game session');
  });

  it('throws an internal error if game session entity creation throws a validation error', async () => {
    const validationError = { type: VALIDATION_ERROR, key: 'some key' };
    dependencies.makeGameSession.mockImplementationOnce(() => {
      throw validationError;
    });
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(genericErrors.INTERNAL_ERROR);
  });

  it('renames the topic with the given topic id in the game session entity', async () => {
    await renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' });
    expect(fakeGameSession.renameTopic).toBeCalledWith('id', 'some name');
  });

  it('throws the caught error if game session throws an input error while renaming a topic', async () => {
    const inputError = { type: INPUT_ERROR };
    fakeGameSession.renameTopic.mockImplementation(() => {
      throw inputError;
    });
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(inputError);
  });

  it('throws the caught error if game session throws a validation error while renaming a topic', async () => {
    const validationError = { type: VALIDATION_ERROR, key: 'some key' };
    fakeGameSession.renameTopic.mockImplementationOnce(() => {
      throw validationError;
    });
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(validationError);
  });

  it('saves the game session entity to the repository', async () => {
    await renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
      topics: 'mocked topics',
      players: 'mocked players',
    });
  });

  it('throws an internal error if saving to the repository throws', async () => {
    dependencies.gameSessionRepository.save.mockRejectedValue('some error');
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(genericErrors.INTERNAL_ERROR);
  });

  it('returns the game session entity', async () => {
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).resolves.toEqual(fakeGameSession);
  });
});
