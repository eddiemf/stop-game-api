import { IGameSessionRepository, makeGameSessionRepository } from './GameSession.repository';

const gameSessionRepository = makeGameSessionRepository();

export { gameSessionRepository, IGameSessionRepository };
