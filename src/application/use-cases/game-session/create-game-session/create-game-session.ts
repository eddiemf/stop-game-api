import {
  type DatabaseError,
  GameSession,
  type GameSessionRepository,
  type ValidationError,
} from '@app/domain';
import type { GameSessionDTO } from '@app/dtos';
import { GameSessionMapper } from '@app/mappers';
import { Fail, Ok, type PromiseResult } from '@shared/result';

interface Input {
  name: string;
}

type Output = PromiseResult<GameSessionDTO, ValidationError | DatabaseError>;

export class CreateGameSession {
  constructor(private gameSessionRepository: GameSessionRepository) {}

  async execute({ name }: Input): Output {
    const sessionCreationResult = GameSession.create({ name });
    if (!sessionCreationResult.isOk) return Fail(sessionCreationResult.error);

    const gameSession = sessionCreationResult.data;

    const saveResult = await this.gameSessionRepository.save(gameSession);
    if (!saveResult.isOk) return Fail(saveResult.error);

    return Ok(GameSessionMapper.toDTO(gameSession));
  }
}
