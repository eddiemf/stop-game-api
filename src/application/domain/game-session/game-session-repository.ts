import type { PromiseResult } from '@shared/result';
import type { DatabaseError } from '../errors/database-error';
import type { GameSession } from './game-session';

export interface GameSessionRepository {
  save: (gameSession: GameSession) => PromiseResult<void, DatabaseError>;
  findById: (id: string) => PromiseResult<GameSession | null, DatabaseError>;
}
