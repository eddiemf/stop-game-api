import { gameSessionRepository } from '../../../repositories';
import { findGameSession } from '../find-game-session';
import { buildRenameTopic, IRenameTopic } from './RenameTopic';

const renameTopic = buildRenameTopic({ gameSessionRepository, findGameSession });

export { renameTopic, IRenameTopic };
