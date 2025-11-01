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
