export const getHashMock = jest.fn();
export const getNameMock = jest.fn();

export const makeFakeGameSessionMock = jest.fn(() => ({
  getHash: getHashMock,
  getName: getNameMock,
}));
