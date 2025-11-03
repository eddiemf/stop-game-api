import type {
  BroadcastToGameSessionError,
  JoinGameSessionError,
  LeaveGameSessionError,
} from '@app/domain';
import type {
  GameSessionRenamedEvent,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  TopicAddedEvent,
  TopicRemovedEvent,
  TopicRenamedEvent,
} from '@app/dtos';
import type { Result } from '@shared/result';

export interface GameSessionService {
  createSession(gameSessionId: string): void;
  addPlayerToSession(
    gameSessionId: string,
    playerUserId: string
  ): Result<void, JoinGameSessionError>;
  removePlayerFromSession(
    gameSessionId: string,
    playerUserId: string
  ): Result<void, LeaveGameSessionError>;
  broadcastToSession(
    gameSessionId: string,
    event: GameSessionEvent
  ): Result<void, BroadcastToGameSessionError>;
}

export type GameSessionEvent =
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | TopicAddedEvent
  | TopicRemovedEvent
  | TopicRenamedEvent
  | GameSessionRenamedEvent;
