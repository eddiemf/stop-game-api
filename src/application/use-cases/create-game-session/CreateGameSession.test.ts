import { genericErrors } from '../../constants';
import {
  getHashMock,
  getNameMock,
  makeFakeGameSessionMock,
} from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildCreateGameSession } from './CreateGameSession';

describe('CreateGameSession', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    makeGameSession: makeFakeGameSessionMock,
  };
  const createGameSession = buildCreateGameSession(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.save.mockResolvedValue(undefined);
    getHashMock.mockReturnValue('mocked hash');
    getNameMock.mockReturnValue('mocked name');
  });

  it('creates a game session entity with the given name', async () => {
    await createGameSession({ name: 'Some name' });
    expect(dependencies.makeGameSession).toBeCalledWith({ name: 'Some name' });
  });

  it('saves the created game session entity in the game session repository', async () => {
    await createGameSession({ name: 'Some name' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
    });
  });

  it('throws an internal error if game session repository throws while saving', async () => {
    dependencies.gameSessionRepository.save.mockRejectedValue('some error');
    await expect(createGameSession({ name: 'Some name' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('returns the created game session entity if there was no errors', async () => {
    await expect(createGameSession({ name: 'Some name' })).resolves.toEqual(
      makeFakeGameSessionMock()
    );
  });
});
