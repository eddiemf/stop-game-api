import {
  type DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  type GAME_SESSION_NOT_IN_LOBBY,
  type IGameSessionEntity,
  type IGameSessionRepository,
  type TOPIC_NOT_FOUND,
} from '../../../../interfaces';
import { Error, Ok, type Result } from '../../../../shared/result';
import { broadcastTopicRemoved } from '../../../message-bus';
import { FindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  sessionId: string;
  topicId: string;
}

export class RemoveTopic {
  static async execute({
    gameSessionRepository,
    sessionId,
    topicId,
  }: IDependencies): Promise<
    Result<
      IGameSessionEntity,
      | typeof DATABASE_ERROR
      | typeof GAME_SESSION_NOT_FOUND
      | typeof TOPIC_NOT_FOUND
      | typeof GAME_SESSION_NOT_IN_LOBBY
    >
  > {
    const gameSessionResult = await FindGameSession.execute({
      gameSessionRepository,
      id: sessionId,
    });
    if (!gameSessionResult.isOk) return Error(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Error(GAME_SESSION_NOT_FOUND);

    const removeResult = gameSession.removeTopic(topicId);
    if (!removeResult.isOk) return Error(removeResult.error);

    const saveResult = await gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Error(saveResult.error);

    broadcastTopicRemoved(gameSession);

    return Ok(gameSession);
  }
}
