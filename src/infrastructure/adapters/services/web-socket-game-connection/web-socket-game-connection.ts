import {
  BroadcastToGameSessionError,
  JoinGameSessionError,
  LeaveGameSessionError,
  SendMessageToPlayerError,
} from '@app/domain';
import type { GameSessionEvent } from '@app/ports';
import { fail, ok } from '@shared/result';

export class WebSocketGameConnection {
  private connections: Map<string, WebSocket> = new Map();
  private sessions: Map<string, Map<string, WebSocket>> = new Map();

  public createSession(gameSessionId: string) {
    this.sessions.set(gameSessionId, new Map());

    return ok(undefined);
  }

  public registerConnection(playerUserId: string, connection: WebSocket) {
    this.connections.set(playerUserId, connection);
  }

  public addPlayerToSession(gameSessionId: string, playerUserId: string) {
    const session = this.sessions.get(gameSessionId);
    if (!session) return fail(new JoinGameSessionError('The session does not exist'));

    const userConnection = this.connections.get(playerUserId);
    if (!userConnection) return fail(new JoinGameSessionError('User connection not found'));

    session.set(playerUserId, userConnection);

    return ok(undefined);
  }

  public removePlayerFromSession(gameSessionId: string, playerUserId: string) {
    const session = this.sessions.get(gameSessionId);
    if (!session) return fail(new LeaveGameSessionError('The session does not exist'));

    session.delete(playerUserId);

    return ok(undefined);
  }

  public broadcastToSession(gameSessionId: string, event: GameSessionEvent) {
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

  public sendMessageToPlayer(playerUserId: string, event: GameSessionEvent) {
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
