import { validationErrorKeys, VALIDATION_ERROR } from '../../constants';
import { inputErrors } from './errors';
import { makeGameSession } from './GameSession';

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

  describe('getTopics', () => {
    it('returns the given topics', () => {
      const topics = [
        { id: '1', name: 'topic 1' },
        { id: '2', name: 'topic 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      expect(gameSession.getTopics()).toEqual(topics);
    });

    it('returns an empty array if no topics were given', () => {
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(gameSession.getTopics()).toEqual([]);
    });
  });

  describe('addTopic', () => {
    it('adds a topic to the game session', () => {
      const topic = { id: '1', name: 'topic' };
      const gameSession = makeGameSession({ name: 'Some name' });
      gameSession.addTopic(topic);
      expect(gameSession.getTopics()).toEqual([topic]);
    });

    it('throws a validation error if the given name is shorter than 2 characters', () => {
      const topic = { id: '1', name: 'a' };
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(() => gameSession.addTopic(topic)).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_SHORT,
          message: 'Topic name is too short (minimum is 2 characters)',
        })
      );
    });

    it('throws a validation error if the given name is bigger than 30 characters', () => {
      const topic = { id: '1', name: 'An incredibly long name with lots of characters' };
      const gameSession = makeGameSession({ name: 'Some name' });
      expect(() => gameSession.addTopic(topic)).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Topic name is too long (maximum is 30 characters)',
        })
      );
    });
  });

  describe('removeTopic', () => {
    it('removes a topic from the game session', () => {
      const topics = [
        { id: '1', name: 'topic 1' },
        { id: '2', name: 'topic 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      gameSession.removeTopic('1');
      expect(gameSession.getTopics()).toEqual([{ id: '2', name: 'topic 2' }]);
    });

    it('throws an input error if the given topic id is not in the game session', () => {
      const topics = [
        { id: '1', name: 'topic 1' },
        { id: '2', name: 'topic 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      expect(() => gameSession.removeTopic('3')).toThrow(
        expect.objectContaining(inputErrors.TOPIC_NOT_FOUND)
      );
    });
  });

  describe('renameTopic', () => {
    it('renames a topic from the game session', () => {
      const topics = [
        { id: '1', name: 'topic 1' },
        { id: '2', name: 'topic 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      gameSession.renameTopic('2', 'another name');
      expect(gameSession.getTopics()).toEqual([
        { id: '1', name: 'topic 1' },
        { id: '2', name: 'another name' },
      ]);
    });

    it('throws a validation error if the given name is shorter than 2 characters', () => {
      const topics = [
        { id: '1', name: 'topic 1' },
        { id: '2', name: 'topic 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      expect(() => gameSession.renameTopic('4', 'a')).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_SHORT,
          message: 'Topic name is too short (minimum is 2 characters)',
        })
      );
    });

    it('throws a validation error if the given name is bigger than 30 characters', () => {
      const topics = [
        { id: '1', name: 'topic 1' },
        { id: '2', name: 'topic 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      expect(() => gameSession.renameTopic('4', 'another really gigantic big name')).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Topic name is too long (maximum is 30 characters)',
        })
      );
    });

    it('throws an input error if the given topic id is not in the game session', () => {
      const topics = [
        { id: '1', name: 'topic 1' },
        { id: '2', name: 'topic 2' },
      ];
      const gameSession = makeGameSession({ name: 'Some name', topics });
      expect(() => gameSession.renameTopic('4', 'another name')).toThrow(
        expect.objectContaining(inputErrors.TOPIC_NOT_FOUND)
      );
    });
  });
});
