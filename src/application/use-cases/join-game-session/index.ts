import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildJoinGameSession, IJoinGameSession } from './JoinGameSession';

const joinGameSession = buildJoinGameSession({ gameSessionRepository, makeGameSession });

export { IJoinGameSession, joinGameSession };
