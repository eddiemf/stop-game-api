import {
  type DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  type IGameSessionRepository,
  type PLAYER_NOT_IN_SESSION,
} from '../../../../interfaces';
import { Error, Ok, type Result } from '../../../../shared/result';
import { broadcastPlayerDisconnected } from '../../../message-bus';
import { FindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  sessionId: string;
  playerId: string;
}

export class LeaveGameSession {
  static async execute({
    gameSessionRepository,
    sessionId,
    playerId,
  }: IDependencies): Promise<
    Result<
      void,
      typeof DATABASE_ERROR | typeof GAME_SESSION_NOT_FOUND | typeof PLAYER_NOT_IN_SESSION
    >
  > {
    const gameSessionResult = await FindGameSession.execute({
      gameSessionRepository,
      id: sessionId,
    });
    if (!gameSessionResult.isOk) return Error(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Error(GAME_SESSION_NOT_FOUND);

    const disconnectResult = gameSession.disconnectPlayer(playerId);
    if (!disconnectResult.isOk) return Error(disconnectResult.error);

    const saveResult = await gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Error(saveResult.error);

    broadcastPlayerDisconnected(gameSession);

    return Ok(undefined);
  }
}
