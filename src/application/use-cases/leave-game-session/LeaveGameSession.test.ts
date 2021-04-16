import { genericErrors } from '../../constants';
import { mockWithInputError, mockWithInternalError } from '../../utils';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildLeaveGameSession } from './LeaveGameSession';

describe('LeaveGameSession', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    findGameSession: jest.fn(),
  };
  const leaveGameSession = buildLeaveGameSession(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session');
    dependencies.gameSessionRepository.save.mockResolvedValue(undefined);
    dependencies.findGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getPlayers.mockReturnValue('mocked players');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
    fakeGameSession.removePlayer.mockReturnValue(undefined);
  });

  it('finds the game session with the given hash', async () => {
    await leaveGameSession({ hash: 'some hash', playerId: 'id' });
    expect(dependencies.findGameSession).toBeCalledWith({ hash: 'some hash' });
  });

  it('throws the caught error if finding game session throws an internal error', async () => {
    const internalError = mockWithInternalError(dependencies.findGameSession);
    await expect(leaveGameSession({ hash: 'some hash', playerId: 'id' })).rejects.toEqual(
      internalError
    );
  });

  it('throws the caught error if finding game session throws an input error', async () => {
    const inputError = mockWithInputError(dependencies.findGameSession);
    await expect(leaveGameSession({ hash: 'some hash', playerId: 'id' })).rejects.toEqual(
      inputError
    );
  });

  it('removes the given player from the game session entity', async () => {
    await leaveGameSession({ hash: 'some hash', playerId: 'id' });
    expect(fakeGameSession.removePlayer).toBeCalledWith('id');
  });

  it('throws the caught error if removing the player throws an input error', async () => {
    const inputError = mockWithInputError(fakeGameSession.removePlayer);
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
