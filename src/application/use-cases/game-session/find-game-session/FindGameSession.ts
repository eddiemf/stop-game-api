import type {
  DATABASE_ERROR,
  IGameSessionEntity,
  IGameSessionRepository,
} from '../../../interfaces';
import { Error, Ok, type Result } from '../../../shared/result';

interface IDependencies {
  gameSessionRepository: IGameSessionRepository;
  id: string;
}

export class FindGameSession {
  static async execute({
    gameSessionRepository,
    id,
  }: IDependencies): Promise<Result<IGameSessionEntity | null, typeof DATABASE_ERROR>> {
    const result = await gameSessionRepository.findById(id);
    if (!result.isOk) return Error(result.error);

    return Ok(result.data);
  }
}
