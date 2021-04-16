import { IError, VALIDATION_ERROR } from '../../constants';

export const mockWithValidationError = (mockedFunction: jest.Mock): IError => {
  const validationError = { type: VALIDATION_ERROR, errorKey: 'some key', message: 'some message' };

  mockedFunction.mockImplementationOnce(() => {
    throw validationError;
  });

  return validationError;
};
