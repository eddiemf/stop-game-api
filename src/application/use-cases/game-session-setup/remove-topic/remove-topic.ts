import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionNotInLobbyError,
  type GameSessionRepository,
  type TopicNotFoundError,
} from '@app/domain';
import { GameSessionMapper, GameTopicMapper } from '@app/mappers';
import { TopicRemovedEvent } from '@app/ports/events';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  topicId: string;
}

export class RemoveTopic {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameSessionService: GameSessionService
  ) {}

  async execute({
    sessionId,
    topicId,
  }: Input): Promise<
    PromiseResult<
      void,
      | DatabaseError
      | GameSessionNotFoundError
      | GameSessionNotInLobbyError
      | TopicNotFoundError
      | BroadcastToGameSessionError
    >
  > {
    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);
    if (!gameSessionResult.isOk) return Fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Fail(new GameSessionNotFoundError('Failed to remove topic'));

    const removeResult = gameSession.removeTopic(topicId);
    if (!removeResult.isOk) return Fail(removeResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Fail(saveResult.error);

    const broadcastResult = this.gameSessionService.broadcastToSession(
      sessionId,
      new TopicRemovedEvent({
        gameSession: GameSessionMapper.toDTO(gameSession),
        topic: GameTopicMapper.toDTO(removeResult.data),
      })
    );
    if (!broadcastResult.isOk) return Fail(broadcastResult.error);

    return Ok(undefined);
  }
}
