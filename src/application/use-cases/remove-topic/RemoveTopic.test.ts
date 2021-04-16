import { genericErrors } from '../../constants';
import { mockWithInputError, mockWithInternalError } from '../../utils';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildRemoveTopic } from './RemoveTopic';

describe('RemoveTopic', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    findGameSession: jest.fn(),
    generateId: jest.fn(),
  };

  const removeTopic = buildRemoveTopic(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.save.mockResolvedValue(true);
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session data');
    dependencies.findGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
    fakeGameSession.getPlayers.mockReturnValue('mocked players');
  });

  it('finds the game session with the given hash', async () => {
    await removeTopic({ gameSessionHash: '1', topicId: 'id' });
    expect(dependencies.findGameSession).toBeCalledWith({ hash: '1' });
  });

  it('throws the caught error if finding the game session throws an internal error', async () => {
    const internalError = mockWithInternalError(dependencies.findGameSession);
    await expect(removeTopic({ gameSessionHash: '1', topicId: 'id' })).rejects.toEqual(
      internalError
    );
  });

  it('throws the caught error if finding the game throws an input error', async () => {
    const inputError = mockWithInputError(dependencies.findGameSession);
    await expect(removeTopic({ gameSessionHash: '1', topicId: 'id' })).rejects.toEqual(inputError);
  });

  it('removes a topic with the given id from the game session entity', async () => {
    await removeTopic({ gameSessionHash: '1', topicId: 'id' });
    expect(fakeGameSession.removeTopic).toBeCalledWith('id');
  });

  it('throws the caught error if game session throws an input error when removing the topic', async () => {
    const inputError = mockWithInputError(fakeGameSession.removeTopic);
    await expect(removeTopic({ gameSessionHash: '1', topicId: 'id' })).rejects.toEqual(inputError);
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
