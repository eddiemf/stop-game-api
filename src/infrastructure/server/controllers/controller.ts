import { ValidationError } from '@app/domain';
import type { ErrorResult, PromiseResult } from '@shared/result';

export interface ControllerRequest {
  body: Record<string, unknown>;
}

export type ControllerResponse<Data> = PromiseResult<
  ControllerSuccessResponse<Data>,
  ControllerErrorResponse
>;

export interface ControllerSuccessResponse<Data> {
  status: number;
  data: Data;
}

export interface ControllerErrorResponse {
  status: number;
  error: {
    message: string;
    code: string;
  };
}

export abstract class Controller {
  protected mapValidationError(
    property: string,
    message: string
  ): ControllerErrorResponse['error'] {
    const validationError = new ValidationError(property, message);

    return {
      message: validationError.message,
      code: validationError.code,
    };
  }

  protected getInternalServerError(): ControllerErrorResponse['error'] {
    return {
      message: 'Something went wrong in the server',
      code: 'InternalServerError',
    };
  }

  protected mapErrorFromResult(
    result: ErrorResult<{ message: string; code: string }>
  ): ControllerErrorResponse['error'] {
    return {
      message: result.error.message,
      code: result.error.code,
    };
  }
}
