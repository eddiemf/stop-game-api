import { AppError } from '@shared/errors';

export class DatabaseError extends AppError<'DatabaseError'> {
  constructor(message: string) {
    super(`Database error: ${message}`, 'DatabaseError');
  }
}
