import { DATABASE_ERROR, GAME_SESSION_NOT_FOUND, INVALID_INPUT } from '../../../interfaces';
import { Error, Ok } from '../../../shared/result';
import { getMockedGameSession } from '../../__mocks__/entities/GameSession.mock';
import { getMockedGameSessionRepository } from '../../__mocks__/repositories/GameSessionRepository.mock';
import { FindGameSessionMock } from '../../__mocks__/use-cases/FindGameSession.mock';
import { RenameGameSession } from './RenameGameSession';

describe('RenameGameSession', () => {
  const gameSessionRepository = getMockedGameSessionRepository();
  const FindGameSession = FindGameSessionMock;
  const mockedGameSession = getMockedGameSession();

  beforeEach(() => {
    FindGameSession.execute.mockResolvedValue(Ok(mockedGameSession));
    mockedGameSession.rename.mockReturnValue(Ok(undefined));
    gameSessionRepository.save.mockResolvedValue(Ok(mockedGameSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a DATABASE_ERROR error if finding the game session fails', async () => {
    FindGameSession.execute.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await RenameGameSession.execute({
      gameSessionRepository,
      FindGameSession,
      gameSessionId: '1',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(FindGameSession.execute).toHaveBeenCalledWith({
      gameSessionRepository,
      id: '1',
    });
  });

  it('returns a GAME_SESSION_NOT_FOUND error if the game session could not be found', async () => {
    FindGameSession.execute.mockResolvedValue(Ok(null));

    const result = await RenameGameSession.execute({
      gameSessionRepository,
      FindGameSession,
      gameSessionId: '1',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(GAME_SESSION_NOT_FOUND);
    expect(FindGameSession.execute).toHaveBeenCalledWith({
      gameSessionRepository,
      id: '1',
    });
  });

  it('returns an INVALID_INPUT error if the name is invalid', async () => {
    mockedGameSession.rename.mockReturnValue(Error(INVALID_INPUT));

    const result = await RenameGameSession.execute({
      gameSessionRepository,
      FindGameSession,
      gameSessionId: '1',
      name: 'Invalid name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(INVALID_INPUT);
    expect(mockedGameSession.rename).toHaveBeenCalledWith('Invalid name');
  });

  it('returns a DATABASE_ERROR error if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await RenameGameSession.execute({
      gameSessionRepository,
      FindGameSession,
      gameSessionId: '1',
      name: 'Some name',
    });
    if (result.isOk) fail('Expected an error');

    expect(result.error).toBe(DATABASE_ERROR);
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
  });

  it('renames the game session', async () => {
    const result = await RenameGameSession.execute({
      gameSessionRepository,
      FindGameSession,
      gameSessionId: '1',
      name: 'Some name',
    });
    if (!result.isOk) fail('Expected success');

    expect(mockedGameSession.rename).toHaveBeenCalledWith('Some name');
    expect(gameSessionRepository.save).toHaveBeenCalledWith(mockedGameSession);
  });
});
