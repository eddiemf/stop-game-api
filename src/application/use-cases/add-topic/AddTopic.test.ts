import { genericErrors } from '../../constants';
import { mockWithInputError, mockWithInternalError, mockWithValidationError } from '../../utils';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { fakeTopic } from '../../__mocks__/entities/Topic.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildAddTopic } from './AddTopic';

describe('AddTopic', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    findGameSession: jest.fn(),
    generateId: jest.fn(),
    makeTopic: jest.fn(),
  };

  const addTopic = buildAddTopic(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.generateId.mockReturnValue('id');
    dependencies.gameSessionRepository.save.mockResolvedValue(true);
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session');
    dependencies.findGameSession.mockReturnValue(fakeGameSession);
    dependencies.makeTopic.mockReturnValue(fakeTopic);
    fakeGameSession.getData.mockReturnValue('mocked data');
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

  it('creates a topic with the given name', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.makeTopic).toBeCalledWith({ name: 'some name' });
  });

  it('throws the caught error if topic throws a validation error when being created', async () => {
    const validationError = mockWithValidationError(dependencies.makeTopic);
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      validationError
    );
  });

  it('adds the created topic to the game session entity', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(fakeGameSession.addTopic).toBeCalledWith(fakeTopic);
  });

  it('throws the caught error if game session throws an input error while adding a topic', async () => {
    const inputError = mockWithInputError(fakeGameSession.addTopic);
    await expect(addTopic({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(inputError);
  });

  it('saves the game session entity to the repository', async () => {
    await addTopic({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith('mocked data');
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
