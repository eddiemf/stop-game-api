import {
  type DatabaseError,
  type GameSession,
  GameSessionNotFoundError,
  type GameSessionNotInLobbyError,
  type GameSessionRepository,
  GameTopic,
  type TopicAlreadyInGameSessionError,
  type ValidationError,
} from '@app/domain';
import { GameSessionMapper, GameTopicMapper } from '@app/mappers';
import { TopicAddedEvent } from '@app/ports/events';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  name: string;
}

export class AddTopic {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameSessionService: GameSessionService
  ) {}

  async execute({
    sessionId,
    name,
  }: Input): Promise<
    PromiseResult<
      GameSession,
      | ValidationError
      | DatabaseError
      | GameSessionNotFoundError
      | GameSessionNotInLobbyError
      | TopicAlreadyInGameSessionError
    >
  > {
    const creationResult = GameTopic.create({ name });
    if (!creationResult.isOk) return Fail(creationResult.error);

    const topic = creationResult.data;
    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);

    if (!gameSessionResult.isOk) return Fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Fail(new GameSessionNotFoundError('Failed to add topic'));

    const addTopicResult = gameSession.addTopic(topic);
    if (!addTopicResult.isOk) return Fail(addTopicResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Fail(saveResult.error);

    this.gameSessionService.broadcastToSession(
      gameSession.getId(),
      new TopicAddedEvent({
        topic: GameTopicMapper.toDTO(topic),
        gameSession: GameSessionMapper.toDTO(gameSession),
      })
    );

    return Ok(gameSession);
  }
}
