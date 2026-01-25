import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionNotInLobbyError,
  type GameSessionRepository,
  type TopicNameAlreadyInSessionError,
  type TopicNotFoundError,
  type UserNotInGameSessionError,
  type ValidationError,
} from '@app/domain';
import { gameSessionToDTO, gameTopicToDTO } from '@app/mappers';
import type { GameConnection } from '@app/ports';
import { fail, ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  userId: string;
  topicId: string;
  newName: string;
}

export class RenameTopic {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameConnection: GameConnection
  ) {}

  async execute({
    sessionId,
    userId,
    topicId,
    newName,
  }: Input): Promise<
    PromiseResult<
      void,
      | DatabaseError
      | GameSessionNotFoundError
      | UserNotInGameSessionError
      | GameSessionNotInLobbyError
      | TopicNotFoundError
      | TopicNameAlreadyInSessionError
      | ValidationError
      | BroadcastToGameSessionError
    >
  > {
    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);
    if (!gameSessionResult.isOk) return fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return fail(new GameSessionNotFoundError('Failed to rename topic'));

    const renameResult = gameSession.renameTopic(topicId, newName, userId);
    if (!renameResult.isOk) return fail(renameResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return fail(saveResult.error);

    const broadcastResult = this.gameConnection.broadcastToSession(sessionId, {
      type: 'TOPIC_RENAMED',
      payload: {
        gameSession: gameSessionToDTO(gameSession),
        topic: gameTopicToDTO(renameResult.data),
      },
    });
    if (!broadcastResult.isOk) return fail(broadcastResult.error);

    return ok(undefined);
  }
}
