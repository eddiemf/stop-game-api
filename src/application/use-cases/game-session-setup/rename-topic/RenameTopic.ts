import {
  type DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  type GAME_SESSION_NOT_IN_LOBBY,
  type IGameSessionEntity,
  type IGameSessionRepository,
  type INVALID_INPUT,
  type TOPIC_NOT_FOUND,
} from '../../../../interfaces';
import { Error, Ok, type Result } from '../../../../shared/result';
import { broadcastTopicRenamed } from '../../../message-bus';
import { FindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  sessionId: string;
  topicId: string;
  name: string;
}

export class RenameTopic {
  static async execute({
    gameSessionRepository,
    sessionId,
    topicId,
    name,
  }: IDependencies): Promise<
    Result<
      IGameSessionEntity,
      | typeof DATABASE_ERROR
      | typeof GAME_SESSION_NOT_FOUND
      | typeof INVALID_INPUT
      | typeof GAME_SESSION_NOT_IN_LOBBY
      | typeof TOPIC_NOT_FOUND
    >
  > {
    const gameSessionResult = await FindGameSession.execute({
      gameSessionRepository,
      id: sessionId,
    });
    if (!gameSessionResult.isOk) return Error(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Error(GAME_SESSION_NOT_FOUND);

    const renameResult = gameSession.renameTopic(topicId, name);
    if (!renameResult.isOk) return Error(renameResult.error);

    const saveResult = await gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Error(saveResult.error);

    broadcastTopicRenamed(gameSession);

    return Ok(gameSession);
  }
}
