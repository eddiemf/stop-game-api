import {
  type DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  type IGameSessionRepository,
  type INVALID_INPUT,
  type PLAYER_ALREADY_IN_GAME_SESSION,
} from '../../../../interfaces';
import { Error, Ok, type Result } from '../../../../shared/result';
import { broadcastPlayerJoined } from '../../../message-bus';
import { PlayerEntity } from '../../domain/game/entities/player/PlayerEntity';
import { FindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  sessionId: string;
  playerName: string;
}

export class JoinGameSession {
  static async execute({
    gameSessionRepository,
    sessionId,
    playerName,
  }: IDependencies): Promise<
    Result<
      string,
      | typeof INVALID_INPUT
      | typeof DATABASE_ERROR
      | typeof GAME_SESSION_NOT_FOUND
      | typeof PLAYER_ALREADY_IN_GAME_SESSION
    >
  > {
    const playerCreationResult = PlayerEntity.create({ name: playerName });
    if (!playerCreationResult.isOk) return Error(playerCreationResult.error);

    const gameSessionResult = await FindGameSession.execute({
      gameSessionRepository,
      id: sessionId,
    });
    if (!gameSessionResult.isOk) return Error(gameSessionResult.error);

    const player = playerCreationResult.data;
    const gameSession = gameSessionResult.data;
    if (!gameSession) return Error(GAME_SESSION_NOT_FOUND);

    const addPlayerResult = gameSession.addPlayer(player);
    if (!addPlayerResult.isOk) return Error(addPlayerResult.error);

    const saveResult = await gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Error(saveResult.error);

    broadcastPlayerJoined(gameSession);

    return Ok(player.id);
  }
}
