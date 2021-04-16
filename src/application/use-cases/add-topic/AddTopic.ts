import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, INPUT_ERROR, VALIDATION_ERROR } from '../../constants';
import { IGameSession } from '../../entities';
import { IFindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  generateId: () => string;
  findGameSession: IFindGameSession;
}

interface IProps {
  gameSessionHash: string;
  name: string;
}

export interface IAddTopic {
  (props: IProps): Promise<IGameSession>;
}

export const buildAddTopic = ({
  gameSessionRepository,
  generateId,
  findGameSession,
}: IDependencies): IAddTopic => {
  const addTopic: IAddTopic = async ({ gameSessionHash, name }) => {
    try {
      const gameSession = await findGameSession({ hash: gameSessionHash });

      gameSession.addTopic({ id: generateId(), name });

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

  return addTopic;
};
