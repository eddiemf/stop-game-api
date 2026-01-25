import { DatabaseError, type GameSession, type GameSessionRepository } from '@app/domain';
import { GameSessionMapper } from '@app/mappers';
import { fail, ok } from '@shared/result';

export class GameSessionInMemoryRepository implements GameSessionRepository {
  private gameSessions: Record<string, any> = {};

  async findById(id: string) {
    const gameSessionData = this.gameSessions[id] || null;
    if (!gameSessionData) return ok(null);

    const gameSession = GameSessionMapper.toEntity(gameSessionData);
    if (!gameSession) return fail(new DatabaseError('Could not map game session data to entity'));

    return ok(gameSession);
  }

  async save(gameSession: GameSession) {
    this.gameSessions[gameSession.getId()] = {
      id: gameSession.getId(),
      name: gameSession.getName(),
      topics: gameSession.getTopics(),
      players: gameSession.getPlayers(),
      state: gameSession.getState(),
    };

    return ok(undefined);
  }
}
