import {
  type BroadcastToGameSessionError,
  type DatabaseError,
  GameSessionNotFoundError,
  type GameSessionRepository,
  type JoinGameSessionError,
  Player,
  type PlayerAlreadyInGameSessionError,
  type ValidationError,
} from '@app/domain';
import { type GameSessionDTO, PlayerJoinedEvent } from '@app/dtos';
import { GameSessionMapper, PlayerMapper } from '@app/mappers';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  playerName: string;
  userId: string;
}

export class JoinGameSession {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameSessionService: GameSessionService
  ) {}

  async execute({
    sessionId,
    playerName,
    userId,
  }: Input): PromiseResult<
    GameSessionDTO,
    | ValidationError
    | DatabaseError
    | GameSessionNotFoundError
    | PlayerAlreadyInGameSessionError
    | JoinGameSessionError
    | BroadcastToGameSessionError
  > {
    const playerCreationResult = Player.create({ name: playerName, userId });
    if (!playerCreationResult.isOk) return Fail(playerCreationResult.error);

    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);
    if (!gameSessionResult.isOk) return Fail(gameSessionResult.error);

    const player = playerCreationResult.data;
    const gameSession = gameSessionResult.data;
    if (!gameSession) return Fail(new GameSessionNotFoundError('Failed to join game session'));

    const addPlayerResult = gameSession.addPlayer(player);
    if (!addPlayerResult.isOk) return Fail(addPlayerResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Fail(saveResult.error);

    const joinSessionResult = this.gameSessionService.addPlayerToSession(
      gameSession.getId(),
      player.getUserId()
    );
    if (!joinSessionResult.isOk) return Fail(joinSessionResult.error);

    const broadcastResult = this.gameSessionService.broadcastToSession(
      gameSession.getId(),
      new PlayerJoinedEvent({
        player: PlayerMapper.toDTO(player),
        gameSession: GameSessionMapper.toDTO(gameSession),
      })
    );
    if (!broadcastResult.isOk) return Fail(broadcastResult.error);

    return Ok(GameSessionMapper.toDTO(gameSession));
  }
}
