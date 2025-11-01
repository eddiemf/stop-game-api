import { DATABASE_ERROR } from '../../../interfaces';
import { Error, Ok } from '../../../shared/result';
import { getMockedGameSessionRepository } from '../../__mocks__/repositories/GameSessionRepository.mock';
import { FindGameSession } from './FindGameSession';

describe('FindGameSession', () => {
  const gameSessionRepository = getMockedGameSessionRepository();

  beforeEach(() => {
    gameSessionRepository.findById.mockResolvedValue(Ok('mocked game session'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the game session from the repository', async () => {
    const result = await FindGameSession.execute({ gameSessionRepository, id: 'mockedId' });
    if (!result.isOk) fail('Expected result to be Ok');

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('mockedId');
    expect(result.data).toEqual('mocked game session');
  });

  it('returns a DATABASE_ERROR error if there was a problem querying the repository', async () => {
    gameSessionRepository.findById.mockResolvedValue(Error(DATABASE_ERROR));

    const result = await FindGameSession.execute({ gameSessionRepository, id: 'mockedId' });
    if (result.isOk) fail('Expected result to be an Error');

    expect(result.error).toEqual(DATABASE_ERROR);
  });
});
