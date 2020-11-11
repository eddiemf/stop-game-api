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
  playerName: string;
}

export interface IJoinGameSession {
  (props: IProps): Promise<IGameSession>;
}

export const buildJoinGameSession = ({
  gameSessionRepository,
  makeGameSession,
}: IDependencies): IJoinGameSession => {
  const joinGameSession: IJoinGameSession = async ({ hash, playerId, playerName }) => {
    try {
      const gameSessionData = await gameSessionRepository.findByHash(hash);
      if (!gameSessionData) throw inputErrors.GAME_SESSION_NOT_FOUND;

      let gameSession;
      try {
        gameSession = makeGameSession(gameSessionData);
      } catch (error) {
        throw genericErrors.INTERNAL_ERROR;
      }

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
