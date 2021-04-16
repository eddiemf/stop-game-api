export interface IError {
  type: string;
  errorKey: string;
  message: string;
}

export const validationErrorKeys = {
  UNKNOWN: 'VALIDATION_ERROR::UNKNOWN',
  MUST_BE_STRING: 'VALIDATION_ERROR::MUST_BE_STRING',
  STRING_TOO_SHORT: 'VALIDATION_ERROR::STRING_TOO_SHORT',
  STRING_TOO_LONG: 'VALIDATION_ERROR::STRING_TOO_LONG',
};

export const inputErrorKeys = {
  TOPIC_NOT_FOUND: 'INPUT_ERROR::TOPIC_NOT_FOUND',
  GAME_SESSION_NOT_FOUND: 'INPUT_ERROR::GAME_SESSION_NOT_FOUND',
  PLAYER_NOT_FOUND: 'INPUT_ERROR::PLAYER_NOT_FOUND',
  PLAYER_ALREADY_IN_GAME_SESSION: 'INPUT_ERROR::PLAYER_ALREADY_IN_GAME_SESSION',
  TOPIC_ALREADY_IN_GAME_SESSION: 'INPUT_ERROR::TOPIC_ALREADY_IN_GAME_SESSION',
};

export const VALIDATION_ERROR = 'VALIDATION_ERROR';
export const INPUT_ERROR = 'INPUT_ERROR';
export const INTERNAL_ERROR = 'INTERNAL_ERROR';

export const genericErrors = {
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

export const inputErrors = {
  GAME_SESSION_NOT_FOUND: {
    type: INPUT_ERROR,
    errorKey: inputErrorKeys.GAME_SESSION_NOT_FOUND,
    message: 'The given game session hash was not found',
  },
  TOPIC_NOT_FOUND: {
    type: INPUT_ERROR,
    errorKey: inputErrorKeys.TOPIC_NOT_FOUND,
    message: 'The given topicId was not found in the game session',
  },
  TOPIC_ALREADY_IN_GAME_SESSION: {
    type: INPUT_ERROR,
    errorKey: inputErrorKeys.TOPIC_ALREADY_IN_GAME_SESSION,
    message: 'The given topicId is already in the game session',
  },
  PLAYER_NOT_FOUND: {
    type: INPUT_ERROR,
    errorKey: inputErrorKeys.PLAYER_NOT_FOUND,
    message: 'The given playerId was not found in the game session',
  },
  PLAYER_ALREADY_IN_GAME_SESSION: {
    type: INPUT_ERROR,
    errorKey: inputErrorKeys.PLAYER_ALREADY_IN_GAME_SESSION,
    message: 'The given playerId is already in the game session',
  },
};
