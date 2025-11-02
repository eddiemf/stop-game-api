import type {
  BroadcastToGameSessionError,
  JoinGameSessionError,
  LeaveGameSessionError,
} from '@app/domain';
import type { Result } from '@shared/result';
import type {
  GameSessionRenamedEvent,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  TopicRenamedEvent,
} from '../events';
import type { TopicAddedEvent } from '../events/topic-added-event';
import type { TopicRemovedEvent } from '../events/topic-removed-event';

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
