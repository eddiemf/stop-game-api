import { gameSessionRepository } from '../../../repositories';
import { findGameSession } from '../find-game-session';
import { buildRenameGameSession, IRenameGameSession } from './RenameGameSession';

const renameGameSession = buildRenameGameSession({ gameSessionRepository, findGameSession });

export { renameGameSession, IRenameGameSession };
