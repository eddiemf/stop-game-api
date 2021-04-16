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
  playerName: string;
}

export interface IJoinGameSession {
  (props: IProps): Promise<IGameSession>;
}

export const buildJoinGameSession = ({
  gameSessionRepository,
  findGameSession,
}: IDependencies): IJoinGameSession => {
  const joinGameSession: IJoinGameSession = async ({ hash, playerId, playerName }) => {
    try {
      const gameSession = await findGameSession({ hash });
      gameSession.addPlayer({ id: playerId, name: playerName });

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

  return joinGameSession;
};
