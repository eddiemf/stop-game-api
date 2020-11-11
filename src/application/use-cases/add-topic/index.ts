import cuid from 'cuid';
import { gameSessionRepository } from '../../../repositories';
import { makeGameSession } from '../../entities';
import { buildAddTopic, IAddTopic } from './AddTopic';

const addTopic = buildAddTopic({ gameSessionRepository, makeGameSession, generateId: cuid.slug });

export { addTopic, IAddTopic };
