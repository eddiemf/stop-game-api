import {
  type DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  type GAME_SESSION_NOT_IN_LOBBY,
  type IGameSessionEntity,
  type IGameSessionRepository,
  type INVALID_INPUT,
  type TOPIC_ALREADY_IN_GAME_SESSION,
} from '../../../../interfaces';
import { Error, Ok, type Result } from '../../../../shared/result';
import { broadcastTopicAdded } from '../../../message-bus';
import { GameTopicEntity } from '../../domain/game/entities/game-topic';
import { FindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  sessionId: string;
  name: string;
}

export class AddTopic {
  static async execute({
    gameSessionRepository,
    sessionId,
    name,
  }: IDependencies): Promise<
    Result<
      IGameSessionEntity,
      | typeof DATABASE_ERROR
      | typeof GAME_SESSION_NOT_FOUND
      | typeof INVALID_INPUT
      | typeof TOPIC_ALREADY_IN_GAME_SESSION
      | typeof GAME_SESSION_NOT_IN_LOBBY
    >
  > {
    const creationResult = GameTopicEntity.create({ name });
    if (!creationResult.isOk) return Error(creationResult.error);

    const topic = creationResult.data;
    const gameSessionResult = await FindGameSession.execute({
      gameSessionRepository,
      id: sessionId,
    });

    if (!gameSessionResult.isOk) return Error(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Error(GAME_SESSION_NOT_FOUND);

    const addTopicResult = gameSession.addTopic(topic);
    if (!addTopicResult.isOk) return Error(addTopicResult.error);

    const saveResult = await gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Error(saveResult.error);

    broadcastTopicAdded(gameSession);

    return Ok(gameSession);
  }
}
