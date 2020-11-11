import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildRemoveTopic, IRemoveTopic } from './RemoveTopic';

const removeTopic = buildRemoveTopic({ gameSessionRepository, makeGameSession });

export { removeTopic, IRemoveTopic };
