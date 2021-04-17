import { validationErrorKeys, VALIDATION_ERROR } from '../../constants';
import { makeTopic } from './Topic';

describe('Topic', () => {
  describe('creation', () => {
    it('throws a validation error if `id` is not a string', () => {
      // @ts-ignore
      expect(() => makeTopic({ id: 1, name: 'Name' })).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.MUST_BE_STRING,
          message: 'Id must be of type string',
          value: 'id',
        })
      );
    });

    it('throws a validation error if `name` is not a string', () => {
      // @ts-ignore
      expect(() => makeTopic({ name: 1 })).toThrow(
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
      expect(() => makeTopic({ name: 'a' })).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_SHORT,
          message: 'Name is too short (minimum is 2 characters)',
          value: 'name',
          context: { minLength: 2, maxLength: 50 },
        })
      );
    });

    it('throws a validation error if `name` has more than 50 characters', () => {
      // @ts-ignore
      expect(() =>
        makeTopic({ name: 'A really long name with more than 50 characters wow' })
      ).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Name is too long (maximum is 50 characters)',
          value: 'name',
          context: { minLength: 2, maxLength: 50 },
        })
      );
    });

    it('throws a validation error if `value` has more than 50 characters', () => {
      // @ts-ignore
      expect(() =>
        makeTopic({
          name: 'Some name',
          value: 'a really gigantic big name with more than 50 characters',
        })
      ).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Value is too long (maximum is 50 characters)',
          value: 'value',
          context: { maxLength: 50 },
        })
      );
    });
  });

  describe('getId', () => {
    it('returns a string hash with more than 4 characters if `id` is not provided', () => {
      const topic = makeTopic({ name: 'Some name' });
      const id = topic.getId();

      expect(typeof id).toEqual('string');
      expect(id.length > 4).toBe(true);
    });

    it('returns the given id if `id` is provided', () => {
      const topic = makeTopic({ id: 'Some id', name: 'Some name' });
      expect(topic.getId()).toEqual('Some id');
    });
  });

  describe('getName', () => {
    it('returns the given name', () => {
      const topic = makeTopic({ name: 'Some name' });
      expect(topic.getName()).toEqual('Some name');
    });
  });

  describe('setName', () => {
    it('sets the topic name', () => {
      const topic = makeTopic({ name: 'Some name' });
      topic.setName('another name');
      expect(topic.getName()).toEqual('another name');
    });

    it('throws a validation error if the given name is shorter than 2 characters', () => {
      const topic = makeTopic({ name: 'Some name' });
      expect(() => topic.setName('a')).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_SHORT,
          message: 'Name is too short (minimum is 2 characters)',
          value: 'name',
          context: { minLength: 2, maxLength: 50 },
        })
      );
    });

    it('throws a validation error if the given name is bigger than 50 characters', () => {
      const topic = makeTopic({ name: 'Some name' });
      expect(() =>
        topic.setName('a really gigantic big name with more than 50 characters')
      ).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Name is too long (maximum is 50 characters)',
          value: 'name',
          context: { minLength: 2, maxLength: 50 },
        })
      );
    });
  });

  describe('getValue', () => {
    it('returns the given value', () => {
      const topic = makeTopic({ name: 'Some name', value: 'Some value' });
      expect(topic.getValue()).toEqual('Some value');
    });

    it('returns an empty string if a value was not provided', () => {
      const topic = makeTopic({ name: 'Some name' });
      expect(topic.getValue()).toEqual('');
    });
  });

  describe('setValue', () => {
    it('sets the topic value', () => {
      const topic = makeTopic({ name: 'Some name' });
      topic.setValue('some value');
      expect(topic.getValue()).toEqual('some value');
    });

    it('throws a validation error if the given value is bigger than 50 characters', () => {
      const topic = makeTopic({ name: 'Some name' });
      expect(() =>
        topic.setValue('a really gigantic big value with more than 50 characters')
      ).toThrow(
        expect.objectContaining({
          type: VALIDATION_ERROR,
          errorKey: validationErrorKeys.STRING_TOO_LONG,
          message: 'Value is too long (maximum is 50 characters)',
          value: 'value',
          context: { maxLength: 50 },
        })
      );
    });
  });

  describe('getData', () => {
    it('returns the topic data', () => {
      const topic = makeTopic({ id: '1', name: 'Some name', value: 'some value' });
      expect(topic.getData()).toEqual({ id: '1', name: 'Some name', value: 'some value' });
    });
  });
});
