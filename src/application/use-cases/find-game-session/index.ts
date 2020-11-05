import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildFindGameSession, IFindGameSession } from './FindGameSession';

const findGameSession = buildFindGameSession({ gameSessionRepository, makeGameSession });

export { IFindGameSession, findGameSession };
