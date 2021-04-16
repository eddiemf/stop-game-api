import { genericErrors } from '../../constants';
import { mockWithInputError, mockWithInternalError, mockWithValidationError } from '../../utils';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildRenameGameSession } from './RenameGameSession';

describe('RenameGameSession', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    findGameSession: jest.fn(),
  };

  const renameGameSession = buildRenameGameSession(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.save.mockResolvedValue(true);
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session');
    dependencies.findGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
    fakeGameSession.getPlayers.mockReturnValue('mocked players');
    fakeGameSession.rename.mockReturnValue(undefined);
  });

  it('finds the game session with the given hash', async () => {
    await renameGameSession({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.findGameSession).toBeCalledWith({ hash: '1' });
  });

  it('throws the caught error if finding the game session throws an internal error', async () => {
    const internalError = mockWithInternalError(dependencies.findGameSession);
    await expect(renameGameSession({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      internalError
    );
  });

  it('throws the caught error if finding the game session throws an input error', async () => {
    const inputError = mockWithInputError(dependencies.findGameSession);
    await expect(renameGameSession({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      inputError
    );
  });

  it('renames the game session entity with the given new name', async () => {
    await renameGameSession({ gameSessionHash: '1', name: 'some name' });
    expect(fakeGameSession.rename).toBeCalledWith('some name');
  });

  it('throws the caught error if game session throws an input error when renaming', async () => {
    const inputError = mockWithInputError(fakeGameSession.rename);
    await expect(renameGameSession({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      inputError
    );
  });

  it('throws the caught error if game session throws a validation error when renaming', async () => {
    const validationError = mockWithValidationError(fakeGameSession.rename);
    await expect(renameGameSession({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      validationError
    );
  });

  it('saves the game session entity to the repository', async () => {
    await renameGameSession({ gameSessionHash: '1', name: 'some name' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
      topics: 'mocked topics',
      players: 'mocked players',
    });
  });

  it('throws an internal error if saving to the repository throws', async () => {
    dependencies.gameSessionRepository.save.mockRejectedValue('some error');
    await expect(renameGameSession({ gameSessionHash: '1', name: 'some name' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('returns the game session entity', async () => {
    await expect(renameGameSession({ gameSessionHash: '1', name: 'some name' })).resolves.toEqual(
      fakeGameSession
    );
  });
});
