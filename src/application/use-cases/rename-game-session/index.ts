import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildRenameGameSession, IRenameGameSession } from './RenameGameSession';

const addTopic = buildRenameGameSession({ gameSessionRepository, makeGameSession });

export { addTopic, IRenameGameSession };
