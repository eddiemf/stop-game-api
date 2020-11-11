import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildRenameTopic, IRenameTopic } from './RenameTopic';

const addTopic = buildRenameTopic({ gameSessionRepository, makeGameSession });

export { addTopic, IRenameTopic };
