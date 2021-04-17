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
  topicId: string;
  name: string;
}

export interface IRenameTopic {
  (props: IProps): Promise<IGameSession>;
}

export const buildRenameTopic = ({
  gameSessionRepository,
  findGameSession,
}: IDependencies): IRenameTopic => {
  const renameTopic: IRenameTopic = async ({ gameSessionHash, topicId, name }) => {
    try {
      const gameSession = await findGameSession({ hash: gameSessionHash });
      gameSession.renameTopic(topicId, name);

      await gameSessionRepository.save(gameSession.getData());

      return gameSession;
    } catch (error) {
      if (error.type === VALIDATION_ERROR || error.type === INPUT_ERROR) throw error;

      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return renameTopic;
};
