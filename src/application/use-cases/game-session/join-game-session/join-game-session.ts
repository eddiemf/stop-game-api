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
import type { GameSessionDTO } from '@app/dtos';
import { gameSessionToDTO, playerToDTO } from '@app/mappers';
import type { GameConnection } from '@app/ports';
import { fail, ok, type PromiseResult } from '@shared/result';

interface Input {
  sessionId: string;
  playerName: string;
  userId: string;
}

export class JoinGameSession {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameConnection: GameConnection
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
    if (!playerCreationResult.isOk) return fail(playerCreationResult.error);

    const gameSessionResult = await this.gameSessionRepository.findById(sessionId);
    if (!gameSessionResult.isOk) return fail(gameSessionResult.error);

    const player = playerCreationResult.data;
    const gameSession = gameSessionResult.data;
    if (!gameSession) return fail(new GameSessionNotFoundError('Failed to join game session'));

    const addPlayerResult = gameSession.addPlayer(player);
    if (!addPlayerResult.isOk) return fail(addPlayerResult.error);

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return fail(saveResult.error);

    const joinSessionResult = this.gameConnection.addPlayerToSession(gameSession.id, player.userId);
    if (!joinSessionResult.isOk) return fail(joinSessionResult.error);

    const broadcastResult = this.gameConnection.broadcastToSession(gameSession.id, {
      type: 'PLAYER_JOINED',
      payload: { player: playerToDTO(player), gameSession: gameSessionToDTO(gameSession) },
    });
    if (!broadcastResult.isOk) return fail(broadcastResult.error);

    return ok(gameSessionToDTO(gameSession));
  }
}
