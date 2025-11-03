import type { GameSessionDTO } from '@app/dtos';
import type { CreateGameSession } from '@app/use-cases';
import { Fail, Ok } from '@shared/result';
import { Controller, type ControllerRequest, type ControllerResponse } from '../controller';

export class GameChannelController extends Controller {
  constructor(private createGameSession: CreateGameSession) {
    super();
  }

  public async create({ body }: ControllerRequest): ControllerResponse<GameSessionDTO> {
    try {
      const { name } = body;

      if (!name || typeof name !== 'string') {
        return Fail({
          status: 400,
          error: this.mapValidationError('name', 'Name must be a string.'),
        });
      }

      const gameSessionResult = await this.createGameSession.execute({ name });

      if (!gameSessionResult.isOk) {
        const error = this.mapErrorFromResult(gameSessionResult);

        if (error.code === 'ValidationError') return Fail({ status: 400, error });

        return Fail({ status: 500, error });
      }

      return Ok({ status: 200, data: gameSessionResult.data });
    } catch (_) {
      return Fail({ status: 500, error: this.getInternalServerError() });
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
