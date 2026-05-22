import { DatabaseError, GameSession, type GameSessionRepository } from '@app/domain';
import { fail, ok } from '@shared/result';

export class GameSessionInMemoryRepository implements GameSessionRepository {
  private gameSessions: Record<string, any> = {};

  async findById(id: string) {
    const gameSessionData = this.gameSessions[id] || null;
    if (!gameSessionData) return ok(null);

    const gameSessionResult = this.toEntity(gameSessionData);
    if (!gameSessionResult.isOk)
      return fail(new DatabaseError('Could not map game session data to entity'));

    return ok(gameSessionResult.data);
  }

  async save(gameSession: GameSession) {
    this.gameSessions[gameSession.id] = {
      id: gameSession.id,
      name: gameSession.name,
      topics: gameSession.topics,
      players: gameSession.players,
      state: gameSession.state,
    };

    return ok(undefined);
  }

  private toEntity(data: any) {
    return GameSession.create({
      name: data.name,
      id: data.id,
      topics: data.topics,
      players: data.players,
      state: data.state,
    });
  }
}
