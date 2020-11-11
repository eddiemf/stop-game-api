import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildLeaveGameSession, ILeaveGameSession } from './LeaveGameSession';

const leaveGameSession = buildLeaveGameSession({ gameSessionRepository, makeGameSession });

export { ILeaveGameSession, leaveGameSession };
