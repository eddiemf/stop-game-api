import { AppError } from '@shared/errors';

export class ValidationError extends AppError<'ValidationError'> {
  public readonly field: string;

  constructor(field: string, message: string) {
    super(`Invalid value for field: ${field}. ${message}`, 'ValidationError');

    this.field = field;
  }
}
