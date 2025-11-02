import { AppError } from '@shared/errors';

export class GameSessionNotInLobbyError extends AppError<'GameSessionNotInLobbyError'> {
  constructor(message: string) {
    super(`${message}. Game session is not in the lobby state.`, 'GameSessionNotInLobbyError');
  }
}

export class TopicAlreadyInGameSessionError extends AppError<'TopicAlreadyInGameSessionError'> {
  constructor(message: string) {
    super(
      `${message}. The topic is already in the game session.`,
      'TopicAlreadyInGameSessionError'
    );
  }
}

export class TopicNotFoundError extends AppError<'TopicNotFoundError'> {
  constructor(message: string) {
    super(`${message}. The topic was not found in the game session.`, 'TopicNotFoundError');
  }
}

export class PlayerAlreadyInGameSessionError extends AppError<'PlayerAlreadyInGameSessionError'> {
  constructor(message: string) {
    super(
      `$${message}. The player is already in the game session.`,
      'PlayerAlreadyInGameSessionError'
    );
  }
}

export class PlayerNotInSessionError extends AppError<'PlayerNotInSessionError'> {
  constructor(message: string) {
    super(`${message}. The player is not in the game session.`, 'PlayerNotInSessionError');
  }
}

export class JoinGameSessionError extends AppError<'JoinGameSessionError'> {
  constructor(message: string) {
    super(`Failed to add player to session. ${message}.`, 'JoinGameSessionError');
  }
}

export class LeaveGameSessionError extends AppError<'LeaveGameSessionError'> {
  constructor(message: string) {
    super(`Failed to remove player from session. ${message}.`, 'LeaveGameSessionError');
  }
}

export class BroadcastToGameSessionError extends AppError<'BroadcastToGameSessionError'> {
  constructor(message: string) {
    super(`Failed to broadcast message to session. ${message}.`, 'BroadcastToGameSessionError');
  }
}

export class SendMessageToPlayerError extends AppError<'SendMessageToPlayerError'> {
  constructor(message: string) {
    super(`Failed to send message to player. ${message}.`, 'SendMessageToPlayerError');
  }
}

export class GameSessionNotFoundError extends AppError<'GameSessionNotFoundError'> {
  constructor(message: string) {
    super(`${message}. Game session not found.`, 'GameSessionNotFoundError');
  }
}
