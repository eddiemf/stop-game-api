import type { GameSessionDTO } from '@app/dtos';
import type { CreateGameSession } from '@app/use-cases';
import type { Request, Response } from 'express';

type CreateGameSessionResponse = Response<
  { gameSession: GameSessionDTO } | { error: string; code: string }
>;

export class GameChannelController {
  constructor(private createGameSession: CreateGameSession) {}

  public async create({ body }: Request, res: CreateGameSessionResponse): Promise<void> {
    const { name } = body;

    const gameSessionResult = await this.createGameSession.execute({ name });

    if (gameSessionResult.isOk) {
      res.status(200).json({ gameSession: gameSessionResult.data });
      return;
    }

    const { message, code } = gameSessionResult.error;

    if (code === 'ValidationError') {
      res.status(400).json({ error: message, code });
    } else {
      res.status(500).json({ error: message, code });
    }

    // GameConnection.createGameChannel(gameSession.id);
  }

  // public static async join({ params, query }: AppRequest) {
  //   const { sessionId } = params;
  //   const { playerName } = query;

  //   const result = await JoinGameSession.execute({
  //     sessionId,
  //     playerName,
  //     gameSessionRepository,
  //   });

  //   if (!result.isOk) {
  //     if (result.error === INVALID_INPUT) {
  //       return {
  //         status: 200,
  //         response: { error: INVALID_INPUT },
  //       };
  //     } else if (result.error === GAME_SESSION_NOT_FOUND) {
  //       return {
  //         status: 200,
  //         response: { error: GAME_SESSION_NOT_FOUND },
  //       };
  //     } else if (result.error === PLAYER_ALREADY_IN_GAME_SESSION) {
  //       return {
  //         status: 200,
  //         response: { error: PLAYER_ALREADY_IN_GAME_SESSION },
  //       };
  //     } else {
  //       return {
  //         status: 500,
  //         response: { error: DATABASE_ERROR },
  //       };
  //     }
  //   }

  //   const playerId = result.data;

  //   return (req: Request, res: Response) =>
  //     GameConnection.joinGameChannel(req, res, sessionId, playerId);
  // }

  // public static async leave({ params, body }: AppRequest) {
  //   const { sessionId } = params;
  //   const { playerId } = body;

  //   const result = await LeaveGameSession.execute({
  //     sessionId,
  //     gameSessionRepository,
  //     playerId,
  //   });

  //   if (!result.isOk) {
  //     if (result.error === DATABASE_ERROR) {
  //       return {
  //         status: 500,
  //         response: { error: DATABASE_ERROR },
  //       };
  //     } else if (result.error === GAME_SESSION_NOT_FOUND) {
  //       return {
  //         status: 200,
  //         response: { error: GAME_SESSION_NOT_FOUND },
  //       };
  //     } else {
  //       return {
  //         status: 200,
  //         response: { error: PLAYER_NOT_IN_SESSION },
  //       };
  //     }
  //   }

  //   return {
  //     status: 200,
  //     response: {},
  //   };
  // }
}
