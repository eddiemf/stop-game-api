import { INTERNAL_ERROR } from '../../constants';

export const mockWithInternalError = (mockedFunction: jest.Mock): string => {
  const internalError = INTERNAL_ERROR;

  mockedFunction.mockImplementationOnce(() => {
    throw internalError;
  });

  return internalError;
};
