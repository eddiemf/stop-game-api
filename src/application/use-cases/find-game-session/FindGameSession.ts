import { IGameSessionRepository } from '../../../repositories';
import { genericErrors } from '../../constants';
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
      if (!gameSessionData) {
        return null;
      }

      return makeGameSession(gameSessionData);
    } catch (error) {
      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return findGameSession;
};
