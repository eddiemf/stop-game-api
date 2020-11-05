import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildCreateGameSession, ICreateGameSession } from './CreateGameSession';

const createGameSession = buildCreateGameSession({ gameSessionRepository, makeGameSession });

export { ICreateGameSession, createGameSession };
