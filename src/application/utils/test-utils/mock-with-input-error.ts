import { IError, INPUT_ERROR } from '../../constants';

export const mockWithInputError = (mockedFunction: jest.Mock): IError => {
  const inputError = { type: INPUT_ERROR, errorKey: 'some key', message: 'some message' };

  mockedFunction.mockImplementationOnce(() => {
    throw inputError;
  });

  return inputError;
};
