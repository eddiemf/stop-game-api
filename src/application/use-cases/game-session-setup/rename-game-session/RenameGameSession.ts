import {
  type DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  type IGameSessionRepository,
  type INVALID_INPUT,
} from '../../../interfaces';
import { Error, Ok, type Result } from '../../../shared/result';
import type { FindGameSession } from '../find-game-session';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  FindGameSession: typeof FindGameSession;
  gameSessionId: string;
  name: string;
}

export class RenameGameSession {
  static async execute({
    gameSessionRepository,
    FindGameSession,
    gameSessionId,
    name,
  }: IDependencies): Promise<
    Result<void, typeof DATABASE_ERROR | typeof GAME_SESSION_NOT_FOUND | typeof INVALID_INPUT>
  > {
    const gameSessionResult = await FindGameSession.execute({
      gameSessionRepository,
      id: gameSessionId,
    });
    if (!gameSessionResult.isOk) return Error(gameSessionResult.error);

    const gameSession = gameSessionResult.data;
    if (!gameSession) return Error(GAME_SESSION_NOT_FOUND);

    const renameResult = gameSession.rename(name);
    if (!renameResult.isOk) return Error(renameResult.error);

    const saveResult = await gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Error(saveResult.error);

    return Ok(undefined);
  }
}
