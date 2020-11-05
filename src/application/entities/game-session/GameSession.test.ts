import { validationErrors } from '../../constants';
import { makeGameSession } from './GameSession';

describe('GameSession', () => {
  describe('creation', () => {
    it('throws a validation error if `hash` is not a string', () => {
      // @ts-ignore
      expect(() => makeGameSession({ hash: 1, name: 'Name' })).toThrow(validationErrors.MUST_BE_STRING);
    });

    it('throws a validation error if `name` is not a string', () => {
      // @ts-ignore
      expect(() => makeGameSession({ name: 1 })).toThrow(validationErrors.MUST_BE_STRING);
    });

    it('throws a validation error if `name` has less than 2 characters', () => {
      expect(() => makeGameSession({ name: '1' })).toThrow(validationErrors.STRING_TOO_SHORT);
    });

    it('throws a validation error if `name` has more than 30 characters', () => {
      expect(() => makeGameSession({ name: 'A long name with more than 30 characters' })).toThrow(
        validationErrors.STRING_TOO_LONG
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
