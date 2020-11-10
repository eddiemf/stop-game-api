import validateJs from 'validate.js';
import { validationErrorKeys } from '../../constants';

interface IValidateJsError {
  validator: string;
  value: string;
  options: any;
}

interface IValidationError {
  errorKey: string;
  message: string;
  value?: string;
  context?: {
    minLength?: number;
    maxLength?: number;
  };
}

const getErrorKeyFromError = ({ value, validator, options }: IValidateJsError) => {
  switch (validator) {
    case 'type': {
      if (options === 'string') return validationErrorKeys.MUST_BE_STRING;

      return validationErrorKeys.UNKNOWN;
    }

    case 'length': {
      const { maximum, minimum } = options;

      if (maximum && value.length > maximum) return validationErrorKeys.STRING_TOO_LONG;
      if (minimum && value.length < minimum) return validationErrorKeys.STRING_TOO_SHORT;

      return validationErrorKeys.UNKNOWN;
    }

    default: {
      return validationErrorKeys.UNKNOWN;
    }
  }
};

const getContextFromError = ({ validator, options }: IValidateJsError) => {
  switch (validator) {
    case 'length': {
      const { maximum, minimum } = options;
      return {
        maxLength: maximum,
        minLength: minimum,
      };
      break;
    }

    default: {
      return undefined;
    }
  }
};

export const validate = (
  fields: Record<string, unknown>,
  constraints: Record<string, unknown>
): IValidationError | null => {
  const errors = validateJs(fields, constraints, { format: 'detailed' });
  if (!errors) return null;

  const error = errors[0];

  const validationError = {
    errorKey: getErrorKeyFromError(error),
    message: error.error,
    value: error.attribute,
    context: getContextFromError(error),
  };

  return validationError;
};
