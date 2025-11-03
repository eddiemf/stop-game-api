import {
  type DatabaseError,
  GameSession,
  type GameSessionRepository,
  type ValidationError,
} from '@app/domain';
import type { GameSessionDTO } from '@app/dtos';
import { GameSessionMapper } from '@app/mappers';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok, type PromiseResult } from '@shared/result';

interface Input {
  name: string;
}

export class CreateGameSession {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private gameSessionService: GameSessionService
  ) {}

  async execute({ name }: Input): PromiseResult<GameSessionDTO, ValidationError | DatabaseError> {
    const sessionCreationResult = GameSession.create({ name });
    if (!sessionCreationResult.isOk) return Fail(sessionCreationResult.error);

    const gameSession = sessionCreationResult.data;

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Fail(saveResult.error);

    this.gameSessionService.createSession(gameSession.getId());

    return Ok(GameSessionMapper.toDTO(gameSession));
  }
}
