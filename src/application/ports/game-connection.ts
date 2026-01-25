import type {
  BroadcastToGameSessionError,
  JoinGameSessionError,
  LeaveGameSessionError,
} from '@app/domain';
import type { GameSessionDTO, GameTopicDTO, PlayerDTO } from '@app/dtos';
import type { Result } from '@shared/result';

export interface GameConnection {
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

type GameSessionEvent =
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | TopicAddedEvent
  | TopicRemovedEvent
  | TopicRenamedEvent
  | GameSessionRenamedEvent;

interface PlayerJoinedEvent {
  type: 'PLAYER_JOINED';
  payload: { player: PlayerDTO; gameSession: GameSessionDTO };
}

interface PlayerLeftEvent {
  type: 'PLAYER_LEFT';
  payload: { player: PlayerDTO; gameSession: GameSessionDTO };
}

interface TopicAddedEvent {
  type: 'TOPIC_ADDED';
  payload: { topic: GameTopicDTO; gameSession: GameSessionDTO };
}

interface TopicRemovedEvent {
  type: 'TOPIC_REMOVED';
  payload: { topic: GameTopicDTO; gameSession: GameSessionDTO };
}

interface TopicRenamedEvent {
  type: 'TOPIC_RENAMED';
  payload: { topic: GameTopicDTO; gameSession: GameSessionDTO };
}

interface GameSessionRenamedEvent {
  type: 'GAME_SESSION_RENAMED';
  payload: { gameSession: GameSessionDTO };
}
