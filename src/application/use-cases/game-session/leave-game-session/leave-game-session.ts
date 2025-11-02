import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionRepository,
  type LeaveGameSessionError,
  type PlayerNotInSessionError,
} from '@app/domain';
import { GameSessionMapper, PlayerMapper } from '@app/mappers';
import { PlayerLeftEvent } from '@app/ports/events';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  userId: string;
}

export class LeaveGameSession {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameSessionService: GameSessionService
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
    if (!gameSessionResult.isOk) return Fail(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Fail(new GameSessionNotFoundError('Failed to leave game session'));

    const disconnectResult = gameSession.disconnectPlayer(userId);
    if (!disconnectResult.isOk) return Fail(disconnectResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Fail(saveResult.error);

    const leaveSessionResult = this.gameSessionService.removePlayerFromSession(
      gameSession.getId(),
      userId
    );
    if (!leaveSessionResult.isOk) return Fail(leaveSessionResult.error);

    const player = disconnectResult.data;
    const broadcastResult = this.gameSessionService.broadcastToSession(
      gameSession.getId(),
      new PlayerLeftEvent({
        player: PlayerMapper.toDTO(player),
        gameSession: GameSessionMapper.toDTO(gameSession),
      })
    );
    if (!broadcastResult.isOk) return Fail(broadcastResult.error);

    return Ok(undefined);
  }
}
