import {
  BroadcastToGameSessionError,
  JoinGameSessionError,
  LeaveGameSessionError,
  SendMessageToPlayerError,
} from '@app/domain';
import type { GameSessionEvent } from '@app/ports/services';
import { fail, ok } from '@shared/result';

export class WebSocketGameSessionService {
  private connections: Map<string, WebSocket> = new Map();
  private sessions: Map<string, Map<string, WebSocket>> = new Map();

  registerConnection(playerUserId: string, connection: WebSocket) {
    this.connections.set(playerUserId, connection);
  }

  createSession(gameSessionId: string) {
    this.sessions.set(gameSessionId, new Map());

    return ok(undefined);
  }

  addPlayerToSession(gameSessionId: string, playerUserId: string) {
    const session = this.sessions.get(gameSessionId);
    if (!session) return fail(new JoinGameSessionError('The session does not exist'));

    const userConnection = this.connections.get(playerUserId);
    if (!userConnection) return fail(new JoinGameSessionError('User connection not found'));

    session.set(playerUserId, userConnection);

    return ok(undefined);
  }

  removePlayerFromSession(gameSessionId: string, playerUserId: string) {
    const session = this.sessions.get(gameSessionId);
    if (!session) return fail(new LeaveGameSessionError('The session does not exist'));

    session.delete(playerUserId);

    return ok(undefined);
  }

  broadcastToSession(gameSessionId: string, event: GameSessionEvent) {
    const session = this.sessions.get(gameSessionId);
    if (!session) return fail(new BroadcastToGameSessionError('The session does not exist'));

    try {
      const message = JSON.stringify(event);

      session.forEach((connection) => {
        connection.send(message);
      });

      return ok(undefined);
    } catch (_) {
      return fail(new BroadcastToGameSessionError('Error parsing event'));
    }
  }

  sendMessageToPlayer(playerUserId: string, event: GameSessionEvent) {
    const connection = this.connections.get(playerUserId);
    if (!connection) return fail(new SendMessageToPlayerError('User connection not found'));

    try {
      const message = JSON.stringify(event);

      connection.send(message);

      return ok(undefined);
    } catch (_) {
      return fail(new SendMessageToPlayerError('Error parsing event'));
    }
  }
}
