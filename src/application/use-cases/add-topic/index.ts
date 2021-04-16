import cuid from 'cuid';
import { gameSessionRepository } from '../../../repositories';
import { findGameSession } from '../find-game-session';
import { buildAddTopic, IAddTopic } from './AddTopic';

const addTopic = buildAddTopic({ gameSessionRepository, findGameSession, generateId: cuid.slug });

export { addTopic, IAddTopic };
