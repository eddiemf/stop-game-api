import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, inputErrors, INPUT_ERROR, VALIDATION_ERROR } from '../../constants';
import { IGameSession, IMakeGameSession } from '../../entities';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  makeGameSession: IMakeGameSession;
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
  makeGameSession,
}: IDependencies): IRenameTopic => {
  const renameTopic: IRenameTopic = async ({ gameSessionHash, topicId, name }) => {
    try {
      const gameSessionData = await gameSessionRepository.findByHash(gameSessionHash);
      if (!gameSessionData) throw inputErrors.GAME_SESSION_NOT_FOUND;

      let gameSession;
      try {
        gameSession = makeGameSession(gameSessionData);
      } catch (error) {
        throw genericErrors.INTERNAL_ERROR;
      }

      gameSession.renameTopic(topicId, name);

      await gameSessionRepository.save({
        hash: gameSession.getHash(),
        name: gameSession.getName(),
        topics: gameSession.getTopics(),
        players: gameSession.getPlayers(),
      });

      return gameSession;
    } catch (error) {
      if (error.type === VALIDATION_ERROR || error.type === INPUT_ERROR) throw error;

      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return renameTopic;
};
