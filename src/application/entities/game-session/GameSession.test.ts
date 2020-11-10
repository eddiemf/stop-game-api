import { validationErrorKeys } from '../../constants';
import { makeGameSession } from './GameSession';

describe('GameSession', () => {
  describe('creation', () => {
    it('throws a validation error if `hash` is not a string', () => {
      // @ts-ignore
      expect(() => makeGameSession({ hash: 1, name: 'Name' })).toThrow(
        expect.objectContaining({
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
});
