import { gameSessionRepository } from '../../../repositories';
import { findGameSession } from '../find-game-session';
import { buildLeaveGameSession, ILeaveGameSession } from './LeaveGameSession';

const leaveGameSession = buildLeaveGameSession({ gameSessionRepository, findGameSession });

export { ILeaveGameSession, leaveGameSession };
