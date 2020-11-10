import { VALIDATION_ERROR } from '../../../application/constants';
import { fakeGameSession } from '../../../application/__mocks__/entities/GameSession.mock';
import { responses } from '../constants';
import { makeGameSessionController } from './GameSession.controller';

describe('GameSessionController', () => {
  const dependencies = {
    createGameSession: jest.fn(),
    findGameSession: jest.fn(),
  };
  const controller = makeGameSessionController(dependencies);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findGameSession', () => {
    const requestMock = {
      params: { hash: 'some hash' },
      body: {},
    };

    it('searches for the game session with the hash from request params', async () => {
      await controller.findGameSession(requestMock);
      expect(dependencies.findGameSession).toBeCalledWith({ hash: requestMock.params.hash });
    });

    describe('when game session was not found', () => {
      beforeEach(() => {
        dependencies.findGameSession.mockResolvedValue(null);
      });

      it('returns status 200 and game session not found error response', async () => {
        await expect(controller.findGameSession(requestMock)).resolves.toEqual({
          status: 200,
          response: responses.GAME_SESSION_NOT_FOUND,
        });
      });
    });

    describe('when game session was found', () => {
      beforeEach(() => {
        dependencies.findGameSession.mockResolvedValue(fakeGameSession);
        fakeGameSession.getHash.mockReturnValue('mocked hash');
        fakeGameSession.getName.mockReturnValue('mocked name');
      });

      it('returns status 200 and the game session data', async () => {
        await expect(controller.findGameSession(requestMock)).resolves.toEqual({
          status: 200,
          response: {
            gameSession: { hash: 'mocked hash', name: 'mocked name' },
          },
        });
      });
    });

    describe('when game session search throws', () => {
      beforeEach(() => {
        dependencies.findGameSession.mockRejectedValue('error');
      });

      it('returns status 500 and an internal server error response', async () => {
        await expect(controller.findGameSession(requestMock)).resolves.toEqual({
          status: 500,
          response: responses.INTERNAL_SERVER_ERROR,
        });
      });
    });
  });

  describe('createGameSession', () => {
    const requestMock = {
      params: {},
      body: { name: 'some name' },
    };

    it('creates a game session with the name from request body', async () => {
      await controller.createGameSession(requestMock);
      expect(dependencies.createGameSession).toBeCalledWith({ name: requestMock.body.name });
    });

    describe('when game session was created successfully', () => {
      beforeEach(() => {
        dependencies.createGameSession.mockResolvedValue(fakeGameSession);
        fakeGameSession.getHash.mockReturnValue('some hash');
      });

      it('returns status 200 and the created game session hash response', async () => {
        await expect(controller.createGameSession(requestMock)).resolves.toEqual({
          status: 200,
          response: { hash: 'some hash' },
        });
      });
    });

    describe('when game session creation throws a validation error', () => {
      beforeEach(() => {
        dependencies.createGameSession.mockRejectedValue({
          type: VALIDATION_ERROR,
          errorKey: 'some key',
        });
      });

      it('returns status 400 and the validation error', async () => {
        await expect(controller.createGameSession(requestMock)).resolves.toEqual({
          status: 400,
          response: { type: VALIDATION_ERROR, errorKey: 'some key' },
        });
      });
    });

    describe('when game session creation throws', () => {
      beforeEach(() => {
        dependencies.createGameSession.mockRejectedValue('error');
      });

      it('returns status 500 and an internal server error response', async () => {
        await expect(controller.createGameSession(requestMock)).resolves.toEqual({
          status: 500,
          response: responses.INTERNAL_SERVER_ERROR,
        });
      });
    });
  });
});
