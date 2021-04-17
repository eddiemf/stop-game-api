import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, INPUT_ERROR, VALIDATION_ERROR } from '../../constants';
import { IGameSession } from '../../entities';
import { IMakeTopic } from '../../entities/topic';
import { IFindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  findGameSession: IFindGameSession;
  makeTopic: IMakeTopic;
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
  findGameSession,
  makeTopic,
}: IDependencies): IAddTopic => {
  const addTopic: IAddTopic = async ({ gameSessionHash, name }) => {
    try {
      const gameSession = await findGameSession({ hash: gameSessionHash });
      const topic = makeTopic({ name });
      gameSession.addTopic(topic);

      await gameSessionRepository.save(gameSession.getData());

      return gameSession;
    } catch (error) {
      if (error.type === VALIDATION_ERROR || error.type === INPUT_ERROR) throw error;

      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return addTopic;
};
