import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionRepository,
  type ValidationError,
} from '@app/domain';
import { GameSessionMapper } from '@app/mappers';
import { GameSessionRenamedEvent } from '@app/ports/events';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok, type PromiseResult } from '@shared/result';

interface Input {
  gameSessionId: string;
  name: string;
}

export class RenameGameSession {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameSessionService: GameSessionService
  ) {}

  async execute({
    gameSessionId,
    name,
  }: Input): PromiseResult<
    void,
    DatabaseError | GameSessionNotFoundError | ValidationError | BroadcastToGameSessionError
  > {
    const gameSessionResult = await this.gameSessionRepository.findById(gameSessionId);
    if (!gameSessionResult.isOk) return Fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Fail(new GameSessionNotFoundError('Failed to rename game session'));

    const renameResult = gameSession.rename(name);
    if (!renameResult.isOk) return Fail(renameResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Fail(saveResult.error);

    const broadcastResult = this.gameSessionService.broadcastToSession(
      gameSessionId,
      new GameSessionRenamedEvent({
        gameSession: GameSessionMapper.toDTO(gameSession),
      })
    );
    if (!broadcastResult.isOk) return Fail(broadcastResult.error);

    return Ok(undefined);
  }
}
