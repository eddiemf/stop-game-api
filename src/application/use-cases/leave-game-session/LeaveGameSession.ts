import { IGameSessionRepository } from '../../../repositories';
import { genericErrors, inputErrors, INPUT_ERROR, VALIDATION_ERROR } from '../../constants';
import { IGameSession, IMakeGameSession } from '../../entities/game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  makeGameSession: IMakeGameSession;
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
  makeGameSession,
}: IDependencies): ILeaveGameSession => {
  const leaveGameSession: ILeaveGameSession = async ({ hash, playerId }) => {
    try {
      const gameSessionData = await gameSessionRepository.findByHash(hash);
      if (!gameSessionData) throw inputErrors.GAME_SESSION_NOT_FOUND;

      let gameSession;
      try {
        gameSession = makeGameSession(gameSessionData);
      } catch (error) {
        throw genericErrors.INTERNAL_ERROR;
      }

      gameSession.removePlayer(playerId);

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

  return leaveGameSession;
};
