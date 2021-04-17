import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, INPUT_ERROR, VALIDATION_ERROR } from '../../constants';
import { IGameSession } from '../../entities';
import { IFindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  findGameSession: IFindGameSession;
}

interface IProps {
  gameSessionHash: string;
  name: string;
}

export interface IRenameGameSession {
  (props: IProps): Promise<IGameSession>;
}

export const buildRenameGameSession = ({
  gameSessionRepository,
  findGameSession,
}: IDependencies): IRenameGameSession => {
  const renameGameSession: IRenameGameSession = async ({ gameSessionHash, name }) => {
    try {
      const gameSession = await findGameSession({ hash: gameSessionHash });
      gameSession.rename(name);

      await gameSessionRepository.save(gameSession.getData());

      return gameSession;
    } catch (error) {
      if (error.type === VALIDATION_ERROR || error.type === INPUT_ERROR) throw error;

      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return renameGameSession;
};
