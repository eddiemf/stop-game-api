import Joi from '@hapi/joi';
import { validationErrors } from '../constants';

export class JoiErrorParser {
  public static getErrorKey(joiError: Joi.ValidationError): string {
    const joiErrorType = joiError.details[0].type;

    switch (joiErrorType) {
      case 'string.base':
        return validationErrors.MUST_BE_STRING;
      case 'string.min':
        return validationErrors.STRING_TOO_SHORT;
      case 'string.max':
        return validationErrors.STRING_TOO_LONG;
      default:
        return '';
    }
  }
}
