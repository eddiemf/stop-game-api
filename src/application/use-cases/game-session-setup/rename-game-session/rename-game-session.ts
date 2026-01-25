import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionRepository,
  type UserNotInGameSessionError,
  type ValidationError,
} from '@app/domain';
import { gameSessionToDTO } from '@app/mappers';
import type { GameConnection } from '@app/ports';
import { fail, ok, type PromiseResult } from '@shared/result';

interface Input {
  gameSessionId: string;
  userId: string;
  name: string;
}

export class RenameGameSession {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameConnection: GameConnection
  ) {}

  async execute({
    gameSessionId,
    name,
    userId,
  }: Input): PromiseResult<
    void,
    | DatabaseError
    | UserNotInGameSessionError
    | GameSessionNotFoundError
    | ValidationError
    | BroadcastToGameSessionError
  > {
    const gameSessionResult = await this.gameSessionRepository.findById(gameSessionId);
    if (!gameSessionResult.isOk) return fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return fail(new GameSessionNotFoundError('Failed to rename game session'));

    const renameResult = gameSession.rename(name, userId);
    if (!renameResult.isOk) return fail(renameResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return fail(saveResult.error);

    const broadcastResult = this.gameConnection.broadcastToSession(gameSessionId, {
      type: 'GAME_SESSION_RENAMED',
      payload: { gameSession: gameSessionToDTO(gameSession) },
    });
    if (!broadcastResult.isOk) return fail(broadcastResult.error);

    return ok(undefined);
  }
}
