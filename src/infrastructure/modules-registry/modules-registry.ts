import { CreateGameSession } from '@app/use-cases';
import { WebSocketGameConnection } from '@infrastructure/adapters';
import { GameSessionInMemoryRepository } from '../adapters/repositories';
import { GameSessionController } from '../server/controllers';

export interface ModulesRegistry {
  gameChannelController: GameSessionController;
}

export function createModulesRegistry(): ModulesRegistry {
  const gameSessionRepository = new GameSessionInMemoryRepository();
  const gameConnection = new WebSocketGameConnection();
  const createGameSession = new CreateGameSession(gameSessionRepository, gameConnection);
  const gameChannelController = new GameSessionController(createGameSession);

  return {
    gameChannelController,
  };
}
