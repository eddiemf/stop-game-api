import cuid from 'cuid';
import { gameSessionRepository } from '../../../repositories';
import { makeTopic } from '../../entities/topic';
import { findGameSession } from '../find-game-session';
import { buildAddTopic, IAddTopic } from './AddTopic';

const addTopic = buildAddTopic({
  gameSessionRepository,
  makeTopic,
  findGameSession,
});

export { addTopic, IAddTopic };
