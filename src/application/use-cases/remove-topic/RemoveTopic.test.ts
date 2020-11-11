import { genericErrors, inputErrors, INPUT_ERROR } from '../../constants';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildRemoveTopic } from './RemoveTopic';

describe('RemoveTopic', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    makeGameSession: jest.fn(),
    generateId: jest.fn(),
  };

  const removeTopic = buildRemoveTopic(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.save.mockResolvedValue(true);
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session data');
    dependencies.makeGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
    fakeGameSession.getPlayers.mockReturnValue('mocked players');
  });

  it('searches for the given game session hash in the repository', async () => {
    await removeTopic({ gameSessionHash: '1', topicId: 'id' });
    expect(dependencies.gameSessionRepository.findByHash).toBeCalledWith('1');
  });

  it('throws an internal error if the search for the game session throws', async () => {
    dependencies.gameSessionRepository.findByHash.mockRejectedValue('some error');
    await expect(removeTopic({ gameSessionHash: '1', topicId: 'id' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('throws an input error if the game session could not be found', async () => {
    dependencies.gameSessionRepository.findByHash.mockResolvedValue(null);
    await expect(removeTopic({ gameSessionHash: '1', topicId: 'id' })).rejects.toEqual(
      inputErrors.GAME_SESSION_NOT_FOUND
    );
  });

  it('creates a game session entity with the found game session data', async () => {
    await removeTopic({ gameSessionHash: '1', topicId: 'id' });
    expect(dependencies.makeGameSession).toBeCalledWith('mocked game session data');
  });

  it('removes a topic with the given id from the game session entity', async () => {
    await removeTopic({ gameSessionHash: '1', topicId: 'id' });
    expect(fakeGameSession.removeTopic).toBeCalledWith('id');
  });

  it('throws the caught error if game session throws an input error while removing the topic', async () => {
    dependencies.makeGameSession.mockImplementation(() => {
      throw { type: INPUT_ERROR };
    });
    await expect(removeTopic({ gameSessionHash: '1', topicId: 'id' })).rejects.toEqual({
      type: INPUT_ERROR,
    });
  });

  it('saves the game session entity to the repository', async () => {
    await removeTopic({ gameSessionHash: '1', topicId: 'id' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
      topics: 'mocked topics',
      players: 'mocked players',
    });
  });

  it('throws an internal error if saving to the repository throws', async () => {
    dependencies.gameSessionRepository.save.mockRejectedValue('some error');
    await expect(removeTopic({ gameSessionHash: '1', topicId: 'id' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('returns the game session entity', async () => {
    await expect(removeTopic({ gameSessionHash: '1', topicId: 'id' })).resolves.toEqual(
      fakeGameSession
    );
  });
});
