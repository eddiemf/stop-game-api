import { genericErrors, inputErrors, VALIDATION_ERROR } from '../../constants';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildFindGameSession } from './FindGameSession';

describe('FindGameSession', () => {
  const falsyValues = ['', null, undefined, 0];
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    makeGameSession: jest.fn(),
  };
  const findGameSession = buildFindGameSession(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.findByHash.mockResolvedValue({
      hash: 'mocked hash',
      name: 'mocked name',
    });
    dependencies.makeGameSession.mockReturnValue(fakeGameSession);
  });

  it('searches for a game session with the given hash in the game session repository', async () => {
    await findGameSession({ hash: 'some hash' });
    expect(dependencies.gameSessionRepository.findByHash).toBeCalledWith('some hash');
  });

  it('throws an internal error if game session repository throws while searching', async () => {
    dependencies.gameSessionRepository.findByHash.mockRejectedValue('some error');
    await expect(findGameSession({ hash: 'some hash' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it.each(falsyValues)('throws an input error if if the search result is %p', async (value) => {
    dependencies.gameSessionRepository.findByHash.mockResolvedValue(value);
    await expect(findGameSession({ hash: 'some hash' })).rejects.toEqual(
      inputErrors.GAME_SESSION_NOT_FOUND
    );
  });

  it('creates a game session entity with the data found in the game session repository', async () => {
    await findGameSession({ hash: 'some hash' });
    expect(dependencies.makeGameSession).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
    });
  });

  it('throws an internal error if game session entity creation throws a validation error', async () => {
    const validationError = { type: VALIDATION_ERROR, key: 'some key' };
    dependencies.makeGameSession.mockImplementation(() => {
      throw validationError;
    });
    await expect(findGameSession({ hash: 'some hash' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('returns the created game session entity if there was no errors', async () => {
    await expect(findGameSession({ hash: 'some hash' })).resolves.toEqual(fakeGameSession);
  });
});
