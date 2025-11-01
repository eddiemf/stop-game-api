import { DatabaseError, type GameSessionRepository } from '@app/domain';
import { Fail, Ok } from '@shared/result';
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CreateGameSession } from './create-game-session';

describe('CreateGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const useCase = new CreateGameSession(gameSessionRepository);

  beforeEach(() => {
    gameSessionRepository.save.mockResolvedValue(Ok(undefined));
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('returns a ValidationError error if game session creation fails due to invalid name', async () => {
    const result = await useCase.execute({ name: 'a' });
    if (result.isOk) throw 'Expected result to be an Error';

    expect(result.error.code).toEqual('ValidationError');
  });

  it('returns a DatabaseError error if game session repository fails while saving', async () => {
    gameSessionRepository.save.mockResolvedValue(Fail(new DatabaseError('Error')));

    const result = await useCase.execute({ name: 'Some name' });
    if (result.isOk) throw 'Expected result to be an Error';

    expect(result.error.code).toEqual('DatabaseError');
    expect(gameSessionRepository.save).toHaveBeenCalled();
  });

  // it('creates a game session with the given name and connected player', async () => {
  //   const result = await useCase.execute({ name: 'Some name',  });
  //   if (!result.isOk) throw 'Expected result to be Ok';

  //   const gameSession = result.data;

  //   expect(gameSession.getName()).toEqual('Some name');
  //   expect(gameSession.getPlayers()[0].getName()).toEqual('Player');
  //   expect(gameSession.getPlayers()[0].getIsConnected()).toEqual(true);
  //   expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
  // });
});
