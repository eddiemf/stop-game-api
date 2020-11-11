import { genericErrors, inputErrors, INPUT_ERROR } from '../../constants';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildAddTopic } from './AddTopic';

describe('AddTopic', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    makeGameSession: jest.fn(),
    generateId: jest.fn(),
  };

  const addTopic = buildAddTopic(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.generateId.mockReturnValue('id');
    dependencies.gameSessionRepository.save.mockResolvedValue(true);
    dependencies.gameSessionRepository.findByHash.mockResolvedValue({
      hash: 'mocked hash',
      name: 'mocked name',
    });
    dependencies.makeGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
  });

  it('searches for the given game session hash in the repository', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.gameSessionRepository.findByHash).toBeCalledWith('1');
  });

  it('throws an internal error if the search for the game session throws', async () => {
    dependencies.gameSessionRepository.findByHash.mockRejectedValue('some error');
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('throws an input error if the game session could not be found', async () => {
    dependencies.gameSessionRepository.findByHash.mockResolvedValue(null);
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      inputErrors.GAME_SESSION_NOT_FOUND
    );
  });

  it('creates a game session entity with the found game session data', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.makeGameSession).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
    });
  });

  it('adds a topic with the given name to the game session entity', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(fakeGameSession.addTopic).toBeCalledWith({ id: 'id', name: 'some name' });
  });

  it('throws the caught error if game session throws an input error while adding a topic', async () => {
    dependencies.makeGameSession.mockImplementation(() => {
      throw { type: INPUT_ERROR };
    });
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual({
      type: INPUT_ERROR,
    });
  });

  it('saves the game session entity to the repository', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
      topics: 'mocked topics',
    });
  });

  it('throws an internal error if saving to the repository throws', async () => {
    dependencies.gameSessionRepository.save.mockRejectedValue('some error');
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('returns the game session entity', async () => {
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).resolves.toEqual(
      fakeGameSession
    );
  });
});
