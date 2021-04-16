import { gameSessionRepository } from '../../../repositories';
import { findGameSession } from '../find-game-session';
import { buildRemoveTopic, IRemoveTopic } from './RemoveTopic';

const removeTopic = buildRemoveTopic({ gameSessionRepository, findGameSession });

export { removeTopic, IRemoveTopic };
