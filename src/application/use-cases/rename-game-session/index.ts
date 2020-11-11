import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildRenameGameSession, IRenameGameSession } from './RenameGameSession';

const renameGameSession = buildRenameGameSession({ gameSessionRepository, makeGameSession });

export { renameGameSession, IRenameGameSession };
