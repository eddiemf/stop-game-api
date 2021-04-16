import { genericErrors } from '../../constants';
import { mockWithInputError, mockWithInternalError, mockWithValidationError } from '../../utils';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildAddTopic } from './AddTopic';

describe('AddTopic', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    findGameSession: jest.fn(),
    generateId: jest.fn(),
  };

  const addTopic = buildAddTopic(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.generateId.mockReturnValue('id');
    dependencies.gameSessionRepository.save.mockResolvedValue(true);
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session');
    dependencies.findGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
    fakeGameSession.getPlayers.mockReturnValue('mocked players');
    fakeGameSession.addTopic.mockReturnValue(undefined);
  });

  it('finds the game session', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.findGameSession).toBeCalledWith({ hash: '1' });
  });

  it('throws an input error if finding game session throws an input error', async () => {
    const inputError = mockWithInputError(dependencies.findGameSession);
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(inputError);
  });

  it('throws a validation error if finding game session throws a validation error', async () => {
    const validationError = mockWithValidationError(dependencies.findGameSession);
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      validationError
    );
  });

  it('throws an internal error if finding game session throws an internal error', async () => {
    const internalError = mockWithInternalError(dependencies.findGameSession);
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      internalError
    );
  });

  it('adds a topic with the given name to the game session entity', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(fakeGameSession.addTopic).toBeCalledWith({ id: 'id', name: 'some name' });
  });

  it('throws the caught error if game session throws an input error while adding a topic', async () => {
    const inputError = mockWithInputError(fakeGameSession.addTopic);
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(inputError);
  });

  it('throws the caught error if game session throws a validation error while adding a topic', async () => {
    const validationError = mockWithValidationError(fakeGameSession.addTopic);
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      validationError
    );
  });

  it('saves the game session entity to the repository', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
      topics: 'mocked topics',
      players: 'mocked players',
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
