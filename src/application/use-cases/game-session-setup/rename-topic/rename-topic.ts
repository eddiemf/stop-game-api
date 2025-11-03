import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionNotInLobbyError,
  type GameSessionRepository,
  type TopicNotFoundError,
  type ValidationError,
} from '@app/domain';
import { TopicRenamedEvent } from '@app/dtos';
import { GameSessionMapper, GameTopicMapper } from '@app/mappers';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  topicId: string;
  name: string;
}

export class RenameTopic {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameSessionService: GameSessionService
  ) {}

  async execute({
    sessionId,
    topicId,
    name,
  }: Input): Promise<
    PromiseResult<
      void,
      | DatabaseError
      | GameSessionNotFoundError
      | GameSessionNotInLobbyError
      | TopicNotFoundError
      | ValidationError
      | BroadcastToGameSessionError
    >
  > {
    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);
    if (!gameSessionResult.isOk) return Fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Fail(new GameSessionNotFoundError('Failed to rename topic'));

    const renameResult = gameSession.renameTopic(topicId, name);
    if (!renameResult.isOk) return Fail(renameResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Fail(saveResult.error);

    const broadcastResult = this.gameSessionService.broadcastToSession(
      sessionId,
      new TopicRenamedEvent({
        gameSession: GameSessionMapper.toDTO(gameSession),
        topic: GameTopicMapper.toDTO(renameResult.data),
      })
    );
    if (!broadcastResult.isOk) return Fail(broadcastResult.error);

    return Ok(undefined);
  }
}
