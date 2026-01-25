import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionRepository,
  type LeaveGameSessionError,
  type PlayerNotInSessionError,
} from '@app/domain';
import { gameSessionToDTO, playerToDTO } from '@app/mappers';
import type { GameConnection } from '@app/ports';
import { fail, ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  userId: string;
}

export class LeaveGameSession {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameConnection: GameConnection
  ) {}

  async execute({
    sessionId,
    userId,
  }: Input): Promise<
    PromiseResult<
      void,
      | DatabaseError
      | GameSessionNotFoundError
      | PlayerNotInSessionError
      | LeaveGameSessionError
      | BroadcastToGameSessionError
    >
  > {
    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);
    if (!gameSessionResult.isOk) return fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return fail(new GameSessionNotFoundError('Failed to leave game session'));

    const disconnectResult = gameSession.disconnectPlayer(userId);
    if (!disconnectResult.isOk) return fail(disconnectResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return fail(saveResult.error);

    const leaveSessionResult = this.gameConnection.removePlayerFromSession(gameSession.id, userId);
    if (!leaveSessionResult.isOk) return fail(leaveSessionResult.error);

    const player = disconnectResult.data;
    const broadcastResult = this.gameConnection.broadcastToSession(gameSession.id, {
      type: 'PLAYER_LEFT',
      payload: { player: playerToDTO(player), gameSession: gameSessionToDTO(gameSession) },
    });
    if (!broadcastResult.isOk) return fail(broadcastResult.error);

    return ok(undefined);
  }
}
