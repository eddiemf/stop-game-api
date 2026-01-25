import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionNotInLobbyError,
  type GameSessionRepository,
  type TopicNotFoundError,
  type UserNotInGameSessionError,
} from '@app/domain';
import { gameSessionToDTO, gameTopicToDTO } from '@app/mappers';
import type { GameConnection } from '@app/ports';
import { fail, ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  topicName: string;
  userId: string;
}

export class RemoveTopic {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameConnection: GameConnection
  ) {}

  async execute({
    sessionId,
    topicName,
    userId,
  }: Input): Promise<
    PromiseResult<
      void,
      | DatabaseError
      | UserNotInGameSessionError
      | GameSessionNotFoundError
      | GameSessionNotInLobbyError
      | TopicNotFoundError
      | BroadcastToGameSessionError
    >
  > {
    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);
    if (!gameSessionResult.isOk) return fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return fail(new GameSessionNotFoundError('Failed to remove topic'));

    const removeResult = gameSession.removeTopic(topicName, userId);
    if (!removeResult.isOk) return fail(removeResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return fail(saveResult.error);

    const broadcastResult = this.gameConnection.broadcastToSession(sessionId, {
      type: 'TOPIC_REMOVED',
      payload: {
        gameSession: gameSessionToDTO(gameSession),
        topic: gameTopicToDTO(removeResult.data),
      },
    });
    if (!broadcastResult.isOk) return fail(broadcastResult.error);

    return ok(undefined);
  }
}
