import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, INPUT_ERROR } from '../../constants';
import { IGameSession } from '../../entities';
import { IFindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  findGameSession: IFindGameSession;
}

interface IProps {
  gameSessionHash: string;
  topicId: string;
}

export interface IRemoveTopic {
  (props: IProps): Promise<IGameSession>;
}

export const buildRemoveTopic = ({
  gameSessionRepository,
  findGameSession,
}: IDependencies): IRemoveTopic => {
  const removeTopic: IRemoveTopic = async ({ gameSessionHash, topicId }) => {
    try {
      const gameSession = await findGameSession({ hash: gameSessionHash });
      gameSession.removeTopic(topicId);

      await gameSessionRepository.save({
        hash: gameSession.getHash(),
        name: gameSession.getName(),
        topics: gameSession.getTopics(),
        players: gameSession.getPlayers(),
      });

      return gameSession;
    } catch (error) {
      if (error.type === INPUT_ERROR) throw error;

      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return removeTopic;
};
