import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, inputErrors, INPUT_ERROR } from '../../constants';
import { IGameSession, IMakeGameSession } from '../../entities';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  makeGameSession: IMakeGameSession;
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
  makeGameSession,
}: IDependencies): IRemoveTopic => {
  const removeTopic: IRemoveTopic = async ({ gameSessionHash, topicId }) => {
    try {
      const gameSessionData = await gameSessionRepository.findByHash(gameSessionHash);
      if (!gameSessionData) throw inputErrors.GAME_SESSION_NOT_FOUND;

      const gameSession = makeGameSession(gameSessionData);
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
