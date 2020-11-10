import { inputErrorKeys, INPUT_ERROR } from '../../constants';

export const inputErrors = {
  TOPIC_NOT_FOUND: {
    type: INPUT_ERROR,
    errorKey: inputErrorKeys.TOPIC_NOT_FOUND,
    message: 'The given topicId was not found in the game session',
  },
};
