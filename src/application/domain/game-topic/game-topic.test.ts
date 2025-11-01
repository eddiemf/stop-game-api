import { describe, expect, it } from 'vitest';
import { GameTopic } from './game-topic';

const createGameTopic = (props: any) => {
  const result = GameTopic.create(props);
  if (!result.isOk) throw 'Expected a valid result';

  return result.data;
};

describe('GameTopic', () => {
  describe('create', () => {
    it('returns a ValidationError if `name` is undefined', () => {
      // @ts-expect-error
      const result = GameTopic.create({ name: undefined });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if `name` has less than 2 characters', () => {
      const result = GameTopic.create({ name: 'a' });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if `name` has more than 50 characters', () => {
      const result = GameTopic.create({
        name: 'A really long name with more than 50 characters wow',
      });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });
  });

  describe('setName', () => {
    it('sets the topic name', () => {
      const topic = createGameTopic({ name: 'Some name' });

      topic.setName('another name');

      expect(topic.getName()).toEqual('another name');
    });

    it('returns a ValidationError if the given name is shorter than 2 characters', () => {
      const topic = createGameTopic({ name: 'Some name' });

      const result = topic.setName('a');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if the given name is bigger than 50 characters', () => {
      const topic = createGameTopic({ name: 'Some name' });

      const result = topic.setName('A really gigantic big name with more than 50 characters');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });
  });
});
