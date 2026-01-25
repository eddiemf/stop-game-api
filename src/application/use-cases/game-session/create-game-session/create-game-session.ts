import {
  type DatabaseError,
  GameSession,
  type GameSessionRepository,
  type ValidationError,
} from '@app/domain';
import type { GameSessionDTO } from '@app/dtos';
import { gameSessionToDTO } from '@app/mappers';
import type { GameConnection } from '@app/ports';
import { fail, ok, type PromiseResult } from '@shared/result';

interface Input {
  name: string;
}

export class CreateGameSession {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameConnection: GameConnection
  ) {}

  async execute({ name }: Input): PromiseResult<GameSessionDTO, ValidationError | DatabaseError> {
    const sessionCreationResult = GameSession.create({ name });
    if (!sessionCreationResult.isOk) return fail(sessionCreationResult.error);

    const gameSession = sessionCreationResult.data;

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return fail(saveResult.error);

    this.gameConnection.createSession(gameSession.id);

    return ok(gameSessionToDTO(gameSession));
  }
}
