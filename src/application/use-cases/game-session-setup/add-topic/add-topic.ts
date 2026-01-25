import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  type GameSession,
  GameSessionNotFoundError,
  type GameSessionNotInLobbyError,
  type GameSessionRepository,
  GameTopic,
  type TopicAlreadyInGameSessionError,
  type UserNotInGameSessionError,
  type ValidationError,
} from '@app/domain';
import type { GameSessionDTO } from '@app/dtos';
import { gameSessionToDTO, gameTopicToDTO } from '@app/mappers';
import type { GameConnection } from '@app/ports';
import { fail, ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  userId: string;
  name: string;
}

export class AddTopic {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameConnection: GameConnection
  ) {}

  async execute({
    sessionId,
    userId,
    name,
  }: Input): Promise<
    PromiseResult<
      GameSessionDTO,
      | ValidationError
      | DatabaseError
      | UserNotInGameSessionError
      | GameSessionNotFoundError
      | GameSessionNotInLobbyError
      | TopicAlreadyInGameSessionError
      | BroadcastToGameSessionError
    >
  > {
    const creationResult = GameTopic.create({ name });
    if (!creationResult.isOk) return fail(creationResult.error);

    const topic = creationResult.data;
    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);

    if (!gameSessionResult.isOk) return fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return fail(new GameSessionNotFoundError('Failed to add topic'));

    const addTopicResult = gameSession.addTopic(topic, userId);
    if (!addTopicResult.isOk) return fail(addTopicResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return fail(saveResult.error);

    const broadcastResult = this.gameConnection.broadcastToSession(gameSession.id, {
      type: 'TOPIC_ADDED',
      payload: {
        topic: gameTopicToDTO(topic),
        gameSession: gameSessionToDTO(gameSession),
      },
    });
    if (!broadcastResult.isOk) return fail(broadcastResult.error);

    return ok(gameSessionToDTO(gameSession));
  }
}
