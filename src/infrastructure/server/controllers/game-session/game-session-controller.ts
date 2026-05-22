import type { CreateGameSession } from '@app/use-cases';
import type { Request, Response } from 'express';
import { Controller } from '../controller';

export class GameSessionController extends Controller {
  constructor(private createGameSession: CreateGameSession) {
    super();
  }

  public async create(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          error: this.mapValidationError('name', 'Name must be a string.'),
        });
      }

      const result = await this.createGameSession.execute({ name });

      if (!result.isOk) {
        const { error } = result;

        if (error.code === 'ValidationError') return res.status(400).json({ error });

        return res.status(500).json({ error });
      }

      return res.status(200).json({ data: result.data });
    } catch (_) {
      return res.status(500).json({ error: this.getInternalServerError() });
    }
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
