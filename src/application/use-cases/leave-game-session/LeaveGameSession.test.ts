import { genericErrors, inputErrors, INPUT_ERROR, VALIDATION_ERROR } from '../../constants';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildLeaveGameSession } from './LeaveGameSession';

describe('LeaveGameSession', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    makeGameSession: jest.fn(),
  };
  const leaveGameSession = buildLeaveGameSession(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session');
    dependencies.gameSessionRepository.save.mockResolvedValue(undefined);
    dependencies.makeGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getPlayers.mockReturnValue('mocked players');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
    fakeGameSession.removePlayer.mockReturnValue(undefined);
  });

  it('searches for a game session with the given hash in the game session repository', async () => {
    await leaveGameSession({ hash: 'some hash', playerId: 'id' });
    expect(dependencies.gameSessionRepository.findByHash).toBeCalledWith('some hash');
  });

  it('throws an internal error if game session repository throws while searching', async () => {
    dependencies.gameSessionRepository.findByHash.mockRejectedValue('some error');
    await expect(leaveGameSession({ hash: 'some hash', playerId: 'id' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('throws an input error if game session was not found in the repository', async () => {
    dependencies.gameSessionRepository.findByHash.mockResolvedValue(null);
    await expect(leaveGameSession({ hash: 'some hash', playerId: 'id' })).rejects.toEqual(
      inputErrors.GAME_SESSION_NOT_FOUND
    );
  });

  it('creates a game session entity with the data found in the game session repository', async () => {
    await leaveGameSession({ hash: 'some hash', playerId: 'id' });
    expect(dependencies.makeGameSession).toBeCalledWith('mocked game session');
  });

  it('throws an internal error if game session entity creation throws a validation error', async () => {
    const validationError = { type: VALIDATION_ERROR, key: 'some key' };
    dependencies.makeGameSession.mockImplementationOnce(() => {
      throw validationError;
    });
    await expect(leaveGameSession({ hash: 'some hash', playerId: 'id' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('removes the given player from the game session entity', async () => {
    await leaveGameSession({ hash: 'some hash', playerId: 'id' });
    expect(fakeGameSession.removePlayer).toBeCalledWith('id');
  });

  it('throws the caught error if removing the player throws an input error', async () => {
    const inputError = { type: INPUT_ERROR, key: 'some key' };
    fakeGameSession.removePlayer.mockImplementationOnce(() => {
      throw inputError;
    });
    await expect(leaveGameSession({ hash: 'some hash', playerId: 'id' })).rejects.toEqual(
      inputError
    );
  });

  it('saves the game session entity in the game session repository', async () => {
    await leaveGameSession({ hash: 'some hash', playerId: 'id' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
      players: 'mocked players',
      topics: 'mocked topics',
    });
  });

  it('throws an internal error if saving game session entity throws', async () => {
    dependencies.gameSessionRepository.save.mockRejectedValue('some error');
    await expect(leaveGameSession({ hash: 'some hash', playerId: 'id' })).rejects.toEqual(
      genericErrors.INTERNAL_ERROR
    );
  });

  it('returns the created game session entity if there was no errors', async () => {
    await expect(leaveGameSession({ hash: 'some hash', playerId: 'id' })).resolves.toEqual(
      fakeGameSession
    );
  });
});
