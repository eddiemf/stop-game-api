import { genericErrors } from '../../constants';
import { mockWithInputError, mockWithInternalError, mockWithValidationError } from '../../utils';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildRenameTopic } from './RenameTopic';

describe('AddTopic', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    findGameSession: jest.fn(),
  };

  const renameTopic = buildRenameTopic(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.save.mockResolvedValue(true);
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session');
    dependencies.findGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getData.mockReturnValue('mocked data');
  });

  it('finds the game session with the given hash', async () => {
    await renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' });
    expect(dependencies.findGameSession).toBeCalledWith({ hash: '1' });
  });

  it('throws the caught error if finding the game session throws an internal error', async () => {
    const internalError = mockWithInternalError(dependencies.findGameSession);
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(internalError);
  });

  it('throws the caught error if finding the game session throws an input error', async () => {
    const inputError = mockWithInputError(dependencies.findGameSession);
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(inputError);
  });

  it('renames the topic with the given topic id in the game session entity', async () => {
    await renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' });
    expect(fakeGameSession.renameTopic).toBeCalledWith('id', 'some name');
  });

  it('throws the caught error if game session throws an input error while renaming a topic', async () => {
    const inputError = mockWithInputError(fakeGameSession.renameTopic);
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(inputError);
  });

  it('throws the caught error if game session throws a validation error while renaming a topic', async () => {
    const validationError = mockWithValidationError(fakeGameSession.renameTopic);
    await expect(
      renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' })
    ).rejects.toEqual(validationError);
  });

  it('saves the game session entity to the repository', async () => {
    await renameTopic({ gameSessionHash: '1', topicId: 'id', name: 'some name' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith('mocked data');
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
