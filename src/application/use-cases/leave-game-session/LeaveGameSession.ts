import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, INPUT_ERROR, VALIDATION_ERROR } from '../../constants';
import { IGameSession } from '../../entities/game-session';
import { IFindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  findGameSession: IFindGameSession;
}

interface IProps {
  hash: string;
  playerId: string;
}

export interface ILeaveGameSession {
  (props: IProps): Promise<IGameSession>;
}

export const buildLeaveGameSession = ({
  gameSessionRepository,
  findGameSession,
}: IDependencies): ILeaveGameSession => {
  const leaveGameSession: ILeaveGameSession = async ({ hash, playerId }) => {
    try {
      const gameSession = await findGameSession({ hash });
      gameSession.removePlayer(playerId);

      await gameSessionRepository.save(gameSession.getData());

      return gameSession;
    } catch (error) {
      if (error.type === VALIDATION_ERROR || error.type === INPUT_ERROR) throw error;

      throw genericErrors.INTERNAL_ERROR;
    }
  };

  return leaveGameSession;
};
