import { IGameSessionRepository } from '../../../repositories';
import { genericErrors } from '../../constants';
import { IGameSession, IMakeGameSession } from '../../entities';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  makeGameSession: IMakeGameSession;
}

interface IProps {
  name: string;
}

export interface ICreateGameSession {
  (props: IProps): Promise<IGameSession>;
}

export const buildCreateGameSession = ({
  gameSessionRepository,
  makeGameSession,
}: IDependencies): ICreateGameSession => {
  const createGameSession: ICreateGameSession = async ({ name }) => {
    try {
      const gameSession = makeGameSession({ name });

      await gameSessionRepository.save({
        hash: gameSession.getHash(),
        name: gameSession.getName(),
      });

      return gameSession;
    } catch (error) {
      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return createGameSession;
};
