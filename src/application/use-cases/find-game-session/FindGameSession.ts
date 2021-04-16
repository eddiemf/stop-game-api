import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, inputErrors, INPUT_ERROR } from '../../constants';
import { IGameSession, IMakeGameSession } from '../../entities/game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  makeGameSession: IMakeGameSession;
}

interface IProps {
  hash: string;
}

export interface IFindGameSession {
  (props: IProps): Promise<IGameSession | null>;
}

export const buildFindGameSession = ({
  gameSessionRepository,
  makeGameSession,
}: IDependencies): IFindGameSession => {
  const findGameSession: IFindGameSession = async ({ hash }) => {
    try {
      const gameSessionData = await gameSessionRepository.findByHash(hash);
      if (!gameSessionData) throw inputErrors.GAME_SESSION_NOT_FOUND;

      return makeGameSession(gameSessionData);
    } catch (error) {
      if (error.type === INPUT_ERROR) throw error;

      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return findGameSession;
};
