import { CreateGameSession } from '@app/use-cases';
import { GameSessionInMemoryRepository } from '../adapters/repositories';
import { GameChannelController } from '../server/controllers';

export interface IocContainer {
  gameChannelController: GameChannelController;
}

export function createIocContainer(): IocContainer {
  const gameSessionRepository = new GameSessionInMemoryRepository();
  const createGameSession = new CreateGameSession(gameSessionRepository);
  const gameChannelController = new GameChannelController(createGameSession);

  return {
    gameChannelController,
  };
}
