import { CreateGameSession } from '@app/use-cases';
import { GameChannelController } from '../controllers';
import { GameSessionInMemoryRepository } from '../repositories';

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
