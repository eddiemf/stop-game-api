import { genericErrors } from '../../constants';
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

  it.each(falsyValues)('returns `null` if the search result is %p', async () => {
    dependencies.gameSessionRepository.findByHash.mockResolvedValue(null);
    await expect(findGameSession({ hash: 'some hash' })).resolves.toEqual(null);
  });

  it('creates a game session entity with the data found in the game session repository', async () => {
    await findGameSession({ hash: 'some hash' });
    expect(dependencies.makeGameSession).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
    });
  });

  it('returns the created game session entity if there was no errors', async () => {
    await expect(findGameSession({ hash: 'some hash' })).resolves.toEqual(fakeGameSession);
  });
});
