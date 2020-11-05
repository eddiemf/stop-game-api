import { buildCreateGameSession } from './CreateGameSession';
import { GameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';

export const createGameSession = buildCreateGameSession({
  gameSessionRepository: new GameSessionRepository(),
  makeGameSession,
});
