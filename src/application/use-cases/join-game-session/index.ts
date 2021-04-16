import { gameSessionRepository } from '../../../repositories';
import { findGameSession } from '../find-game-session';
import { buildJoinGameSession, IJoinGameSession } from './JoinGameSession';

const joinGameSession = buildJoinGameSession({ gameSessionRepository, findGameSession });

export { IJoinGameSession, joinGameSession };
