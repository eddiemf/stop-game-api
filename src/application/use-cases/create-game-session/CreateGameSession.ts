import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, VALIDATION_ERROR } from '../../constants';
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

      await gameSessionRepository.save(gameSession.getData());

      return gameSession;
    } catch (error) {
      if (error.type === VALIDATION_ERROR) throw error;

      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return createGameSession;
};
