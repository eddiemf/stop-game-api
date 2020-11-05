import { makeGameSession } from '../../entities';
import { GameSessionRepository } from '../../../repositories';
import { buildFindGameSession } from './FindGameSession';

export const findGameSession = buildFindGameSession({
  gameSessionRepository: new GameSessionRepository(),
  makeGameSession,
});
