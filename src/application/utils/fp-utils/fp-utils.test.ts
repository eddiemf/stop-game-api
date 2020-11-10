import { appendToList, insertToList, removeFromList } from './fp-utils';

describe('fp-utils', () => {
  describe('appendToList', () => {
    it('appends an item to the given list', () => {
      const list = [1];
      expect(appendToList(list, 2)).toEqual([1, 2]);
    });

    it('does not mutate the original list', () => {
      const list = [1];
      const newList = appendToList(list, 2);
      expect(list).not.toBe(newList);
    });
  });

  describe('removeFromList', () => {
    it('removes an item from the given list', () => {
      const list = [0, 1, 2];
      expect(removeFromList(list, 1)).toEqual([0, 2]);
    });

    it('does not mutate the original list', () => {
      const list = [0, 1, 2];
      const newList = removeFromList(list, 1);
      expect(list).not.toBe(newList);
    });
  });

  describe('insertToList', () => {
    it('inserts an item to the given list', () => {
      const list = [1, 2, 4, 5];
      expect(insertToList(list, 3, 2)).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not mutate the original list', () => {
      const list = [0, 1, 2];
      const newList = insertToList(list, 1, 1);
      expect(list).not.toBe(newList);
    });
  });
});
