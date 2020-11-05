import { createGameSession, findGameSession } from '../../../application/use-cases';
import { makeGameSessionController } from './GameSession.controller';

export const gameSessionController = makeGameSessionController({
  createGameSession,
  findGameSession,
});
