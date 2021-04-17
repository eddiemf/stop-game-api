import { inputErrors, validationErrorKeys, VALIDATION_ERROR } from '../../constants';
import { makeTopic } from '../topic';
import { GameSessionState, makeGameSession } from './GameSession';

describe('GameSession', () => {
  describe('creation', () => {
    it('throws a validation error if `hash` is not a string', () => {
      // @ts-ignore
      expect(() => makeGameSession({ hash: 1, name: 'Name' })).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.MUST_BE_STRING,
          message: 'Hash must be of type string',
          value: 'hash',
        })
      );
    });

    it('throws a validation error if `name` is not a string', () => {
      // @ts-ignore
      expect(() => makeGameSession({ name: 1 })).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.MUST_BE_STRING,
          message: 'Name must be of type string',
          value: 'name',
        })
      );
    });

    it('throws a validation error if `name` has less than 2 characters', () => {
      // @ts-ignore
      expect(() => makeGameSession({ name: 'a' })).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_SHORT,
          message: 'Name is too short (minimum is 2 characters)',
          value: 'name',
          context: { minLength: 2, maxLength: 30 },
        })
      );
    });

    it('throws a validation error if `name` has more than 30 characters', () => {
      // @ts-ignore
      expect(() => makeGameSession({ name: 'A long name with more than 30 characters' })).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Name is too long (maximum is 30 characters)',
          value: 'name',
          context: { minLength: 2, maxLength: 30 },
        })
      );
    });
  });

  describe('getHash', () => {
    it('returns a string hash with more than 4 characters if `hash` is not provided', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      const hash = gameSession.getHash();

      expect(typeof hash).toEqual('string');
      expect(hash.length > 4).toBe(true);
    });

    it('returns the given hash if `hash` is provided', () => {
      const gameSession = makeGameSession({ hash: 'Some hash', name: 'Some name' });
      expect(gameSession.getHash()).toEqual('Some hash');
    });
  });

  describe('getName', () => {
    it('returns the given name', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(gameSession.getName()).toEqual('Some name');
    });
  });

  describe('rename', () => {
    it('renames the game session', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      gameSession.rename('another name');
      expect(gameSession.getName()).toEqual('another name');
    });

    it('throws a validation error if the given name is shorter than 2 characters', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(() => gameSession.rename('a')).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_SHORT,
          message: 'Name is too short (minimum is 2 characters)',
        })
      );
    });

    it('throws a validation error if the given name is bigger than 30 characters', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(() => gameSession.rename('another really gigantic big name')).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Name is too long (maximum is 30 characters)',
        })
      );
    });
  });

  describe('getTopics', () => {
    it('returns the given topics', () => {
      const topics = [
        { id: '1', name: 'topic 1', value: '' },
        { id: '2', name: 'topic 2', value: '' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      const returnedTopics = gameSession.getTopics();
      expect(returnedTopics[0].getName()).toEqual('topic 1');
      expect(returnedTopics[1].getName()).toEqual('topic 2');
    });

    it('returns an empty array if no topics were given', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(gameSession.getTopics()).toEqual([]);
    });
  });

  describe('addTopic', () => {
    it('adds a topic to the game session', () => {
      const topic = makeTopic({ id: '1', name: 'topic' });
      const gameSession = makeGameSession({ name: 'Some name' });
      gameSession.addTopic(topic);
      expect(gameSession.getTopics()).toEqual([topic]);
    });

    it.each([GameSessionState.preMatch, GameSessionState.inMatch, GameSessionState.postMatch])(
      'throws an input error if the session state is %',
      (sessionState) => {
        const topic = { id: '1', name: 'some name', value: '' };
        const gameSession = makeGameSession({
          name: 'Some name',
          topics: [topic],
          state: sessionState,
        });
        expect(() => gameSession.addTopic(makeTopic(topic))).toThrow(
          expect.objectContaining(inputErrors.GAME_SESSION_NOT_IN_LOBBY)
        );
      }
    );

    it('throws an input error if the given topic id is already in the game session', () => {
      const topic = { id: '1', name: 'some name', value: '' };
      const gameSession = makeGameSession({ name: 'Some name', topics: [topic] });
      expect(() => gameSession.addTopic(makeTopic(topic))).toThrow(
        expect.objectContaining(inputErrors.TOPIC_ALREADY_IN_GAME_SESSION)
      );
    });
  });

  describe('removeTopic', () => {
    it('removes a topic from the game session', () => {
      const topic1 = { id: '1', name: 'topic 1', value: '' };
      const topic2 = { id: '2', name: 'topic 2', value: '' };
      const topics = [topic1, topic2];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      gameSession.removeTopic('1');
      expect(gameSession.getTopics()[0].getName()).toEqual('topic 2');
    });

    it.each([GameSessionState.preMatch, GameSessionState.inMatch, GameSessionState.postMatch])(
      'throws an input error if the session state is %',
      (sessionState) => {
        const topic = { id: '1', name: 'some name', value: '' };
        const gameSession = makeGameSession({
          name: 'Some name',
          topics: [topic],
          state: sessionState,
        });
        expect(() => gameSession.removeTopic('1')).toThrow(
          expect.objectContaining(inputErrors.GAME_SESSION_NOT_IN_LOBBY)
        );
      }
    );

    it('throws an input error if the given topic id is not in the game session', () => {
      const topics = [
        { id: '1', name: 'topic 1', value: '' },
        { id: '2', name: 'topic 2', value: '' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      expect(() => gameSession.removeTopic('3')).toThrow(
        expect.objectContaining(inputErrors.TOPIC_NOT_FOUND)
      );
    });
  });

  describe('renameTopic', () => {
    it('renames a topic from the game session', () => {
      const topic1 = { id: '1', name: 'topic 1', value: '' };
      const topic2 = { id: '2', name: 'topic 2', value: '' };
      const topics = [topic1, topic2];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      gameSession.renameTopic('2', 'another name');
      expect(gameSession.getTopics()[1].getName()).toEqual('another name');
    });

    it.each([GameSessionState.preMatch, GameSessionState.inMatch, GameSessionState.postMatch])(
      'throws an input error if the session state is %',
      (sessionState) => {
        const topic = { id: '1', name: 'some name', value: '' };
        const gameSession = makeGameSession({
          name: 'Some name',
          topics: [topic],
          state: sessionState,
        });
        expect(() => gameSession.renameTopic('1', 'another name')).toThrow(
          expect.objectContaining(inputErrors.GAME_SESSION_NOT_IN_LOBBY)
        );
      }
    );

    it('throws an input error if the given topic id is not in the game session', () => {
      const topics = [
        { id: '1', name: 'topic 1', value: '' },
        { id: '2', name: 'topic 2', value: '' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      expect(() => gameSession.renameTopic('4', 'another name')).toThrow(
        expect.objectContaining(inputErrors.TOPIC_NOT_FOUND)
      );
    });
  });

  describe('getPlayers', () => {
    it('returns the given players', () => {
      const players = [
        { id: '1', name: 'player 1' },
        { id: '2', name: 'player 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', players });
      expect(gameSession.getPlayers()).toEqual(players);
    });

    it('returns an empty array if no players were given', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(gameSession.getPlayers()).toEqual([]);
    });
  });

  describe('addPlayer', () => {
    it('adds a player to the game session', () => {
      const player = { id: '1', name: 'player' };
      const gameSession = makeGameSession({ name: 'Some name' });
      gameSession.addPlayer(player);
      expect(gameSession.getPlayers()).toEqual([player]);
    });

    it('throws a validation error if the given name is shorter than 2 characters', () => {
      const player = { id: '1', name: 'a' };
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(() => gameSession.addPlayer(player)).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_SHORT,
          message: 'Player name is too short (minimum is 2 characters)',
        })
      );
    });

    it('throws a validation error if the given name is bigger than 30 characters', () => {
      const player = { id: '1', name: 'An incredibly long name with lots of characters' };
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(() => gameSession.addPlayer(player)).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Player name is too long (maximum is 30 characters)',
        })
      );
    });

    it('throws an input error if the given player id is already in the game session', () => {
      const player = { id: '1', name: 'some name' };
      const gameSession = makeGameSession({ name: 'Some name', players: [player] });
      expect(() => gameSession.addPlayer(player)).toThrow(
        expect.objectContaining(inputErrors.PLAYER_ALREADY_IN_GAME_SESSION)
      );
    });
  });

  describe('removePlayer', () => {
    it('removes a player from the game session', () => {
      const players = [
        { id: '1', name: 'player 1' },
        { id: '2', name: 'player 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', players });
      gameSession.removePlayer('1');
      expect(gameSession.getPlayers()).toEqual([{ id: '2', name: 'player 2' }]);
    });

    it('throws an input error if the given player id is not in the game session', () => {
      const players = [
        { id: '1', name: 'player 1' },
        { id: '2', name: 'player 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', players });
      expect(() => gameSession.removePlayer('3')).toThrow(
        expect.objectContaining(inputErrors.PLAYER_NOT_FOUND)
      );
    });
  });

  describe('getState', () => {
    it('returns the given state', () => {
      const gameSession = makeGameSession({ name: 'Some name', state: GameSessionState.postMatch });
      expect(gameSession.getState()).toEqual(GameSessionState.postMatch);
    });

    it('returns `lobby` if initial state was not provided', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(gameSession.getState()).toEqual(GameSessionState.lobby);
    });
  });

  describe('setState', () => {
    it('sets the state', () => {
      const gameSession = makeGameSession({ name: 'Some name', state: GameSessionState.lobby });
      gameSession.setState(GameSessionState.preMatch);
      expect(gameSession.getState()).toEqual(GameSessionState.preMatch);
    });
  });

  describe('getData', () => {
    it('returns the game session data', () => {
      const topics = [
        { id: '1', name: 'topic 1', value: '' },
        { id: '2', name: 'topic 2', value: '' },
      ];
      const players = [
        { id: '1', name: 'player 1' },
        { id: '2', name: 'player 2' },
      ];

      const gameSession = makeGameSession({
        hash: '1',
        name: 'Some name',
        topics,
        players,
        state: GameSessionState.postMatch,
      });
      const data = gameSession.getData();

      expect(data).toEqual({
        hash: '1',
        name: 'Some name',
        topics: [
          { id: '1', name: 'topic 1', value: '' },
          { id: '2', name: 'topic 2', value: '' },
        ],
        players: [
          { id: '1', name: 'player 1' },
          { id: '2', name: 'player 2' },
        ],
        state: GameSessionState.postMatch,
      });
    });
  });
});
