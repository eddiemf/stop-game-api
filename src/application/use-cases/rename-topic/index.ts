import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildRenameTopic, IRenameTopic } from './RenameTopic';

const renameTopic = buildRenameTopic({ gameSessionRepository, makeGameSession });

export { renameTopic, IRenameTopic };
