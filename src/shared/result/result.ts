export type Result<T, E> = SuccessResult<T> | ErrorResult<E>;
export type SuccessResult<T> = { isOk: true; data: T };
export type ErrorResult<E> = { isOk: false; error: E };

export type PromiseResult<T, E> = Promise<Result<T, E>>;

export const Ok = <T>(data: T): Result<T, never> => ({ isOk: true, data });

export const Fail = <E>(error: E): Result<never, E> => ({
  isOk: false,
  error,
});
