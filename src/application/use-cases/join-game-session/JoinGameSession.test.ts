import { genericErrors } from '../../constants';
import { mockWithInputError, mockWithInternalError, mockWithValidationError } from '../../utils';
import { fakeGameSession } from '../../__mocks__/entities/GameSession.mock';
import { gameSessionRepositoryMock } from '../../__mocks__/repositories/GameSession.mock';
import { buildJoinGameSession } from './JoinGameSession';

describe('JoinGameSession', () => {
  const dependencies = {
    gameSessionRepository: gameSessionRepositoryMock,
    findGameSession: jest.fn(),
  };
  const joinGameSession = buildJoinGameSession(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies.gameSessionRepository.findByHash.mockResolvedValue('mocked game session');
    dependencies.gameSessionRepository.save.mockResolvedValue(undefined);
    dependencies.findGameSession.mockReturnValue(fakeGameSession);
    fakeGameSession.getHash.mockReturnValue('mocked hash');
    fakeGameSession.getName.mockReturnValue('mocked name');
    fakeGameSession.getPlayers.mockReturnValue('mocked players');
    fakeGameSession.getTopics.mockReturnValue('mocked topics');
    fakeGameSession.addPlayer.mockReturnValue(undefined);
  });

  it('finds the game session with the given hash', async () => {
    await joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' });
    expect(dependencies.findGameSession).toBeCalledWith({ hash: 'some hash' });
  });

  it('throws the caught error if finding game session throws an internal error', async () => {
    const internalError = mockWithInternalError(dependencies.findGameSession);
    await expect(
      joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' })
    ).rejects.toEqual(internalError);
  });

  it('throws the caught error if finding game session throws an input error', async () => {
    const inputError = mockWithInputError(dependencies.findGameSession);
    await expect(
      joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' })
    ).rejects.toEqual(inputError);
  });

  it('adds the given player to the game session entity', async () => {
    await joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' });
    expect(fakeGameSession.addPlayer).toBeCalledWith({ id: 'id', name: 'some name' });
  });

  it('throws the caught error if adding the player throws an input error', async () => {
    const inputError = mockWithInputError(fakeGameSession.addPlayer);
    await expect(
      joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' })
    ).rejects.toEqual(inputError);
  });

  it('throws the caught error if adding the player throws a validation error', async () => {
    const validationError = mockWithValidationError(fakeGameSession.addPlayer);
    await expect(
      joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' })
    ).rejects.toEqual(validationError);
  });

  it('saves the game session entity in the game session repository', async () => {
    await joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' });
    expect(dependencies.gameSessionRepository.save).toBeCalledWith({
      hash: 'mocked hash',
      name: 'mocked name',
      players: 'mocked players',
      topics: 'mocked topics',
    });
  });

  it('throws an internal error if saving game session entity throws', async () => {
    dependencies.gameSessionRepository.save.mockRejectedValue('some error');
    await expect(
      joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' })
    ).rejects.toEqual(genericErrors.INTERNAL_ERROR);
  });

  it('returns the created game session entity if there was no errors', async () => {
    await expect(
      joinGameSession({ hash: 'some hash', playerId: 'id', playerName: 'some name' })
    ).resolves.toEqual(fakeGameSession);
  });
});
