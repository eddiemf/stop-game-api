import { Request, RequestHandler } from '..';
import { VALIDATION_ERROR } from '../../../application/constants';
import { IFindGameSession } from '../../../application/use-cases';
import { ICreateGameSession } from '../../../application/use-cases/create-game-session';
import { responses } from '../constants';

interface IDependencies {
  createGameSession: ICreateGameSession;
  findGameSession: IFindGameSession;
}

interface IGameSessionController {
  findGameSession: RequestHandler;
  createGameSession: RequestHandler;
}

export const makeGameSessionController = ({
  createGameSession,
  findGameSession,
}: IDependencies): IGameSessionController => ({
  findGameSession: async ({ params }: Request) => {
    try {
      const { hash } = params;

      const gameSession = await findGameSession({ hash });
      if (!gameSession) {
        return {
          status: 200,
          response: responses.GAME_SESSION_NOT_FOUND,
        };
      }

      return {
        status: 200,
        response: {
          gameSession: {
            hash: gameSession.getHash(),
            name: gameSession.getName(),
          },
        },
      };
    } catch (error) {
      return {
        status: 500,
        response: responses.INTERNAL_SERVER_ERROR,
      };
    }
  },

  createGameSession: async ({ body }: Request) => {
    const { name } = body;

    try {
      const gameSession = await createGameSession({ name });
      return {
        status: 200,
        response: { hash: gameSession.getHash(), name: gameSession.getName() },
      };
    } catch (error) {
      if (error.type === VALIDATION_ERROR) {
        return {
          status: 400,
          response: error,
        };
      }

      return {
        status: 500,
        response: responses.INTERNAL_SERVER_ERROR,
      };
    }
  },
});
