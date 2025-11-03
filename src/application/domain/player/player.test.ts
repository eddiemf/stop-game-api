import { describe, expect, it } from 'vitest';
import { Player } from './player';

const createPlayer = (props: any) => {
  const result = Player.create(props);
  if (!result.isOk) throw 'Expected a valid result';

  return result.data;
};

describe('Player', () => {
  describe('create', () => {
    it('creates a player with a random id if `id` is not given', () => {
      const result = Player.create({ name: 'New player', userId: 'user-id' });
      if (!result.isOk) throw 'Expected player to be created';

      const player = result.data;

      expect(player.getId()).toEqual(expect.stringMatching(/^[a-z0-9-]+$/));
    });

    it('creates a player with the given `id`', () => {
      const result = Player.create({ id: 'id', name: 'New player', userId: 'user-id' });
      if (!result.isOk) throw 'Expected player to be created';

      const player = result.data;

      expect(player.getId()).toEqual('id');
    });

    it('returns a ValidationError if `name` has less than 2 characters', () => {
      const result = Player.create({ name: 'a', userId: 'user-id' });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if `name` has more than 50 characters', () => {
      const result = Player.create({
        name: 'A really long name with more than 50 characters wow',
        userId: 'user-id',
      });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('creates a player with `isConnected` set to `true` when it is not given', () => {
      const result = Player.create({ name: 'New player', userId: 'user-id' });
      if (!result.isOk) throw 'Expected player to be created';

      const player = result.data;

      expect(player.getIsConnected()).toEqual(true);
    });

    it('creates a player with `isConnected` set to `false` when it is given', () => {
      const result = Player.create({ name: 'New player', isConnected: false, userId: 'user-id' });
      if (!result.isOk) throw 'Expected player to be created';

      const player = result.data;

      expect(player.getIsConnected()).toEqual(false);
    });
  });

  describe('setName', () => {
    it('sets the player name', () => {
      const player = createPlayer({ name: 'Old name' });

      player.setName('New name');

      expect(player.getName()).toEqual('New name');
    });

    it('returns a ValidationError if the given name is shorter than 2 characters', () => {
      const player = createPlayer({ name: 'Old name' });

      const setNameResult = player.setName('a');
      if (setNameResult.isOk) throw 'Expected an error';

      expect(setNameResult.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if the given name is bigger than 50 characters', () => {
      const player = createPlayer({ name: 'Old name' });

      const setNameResult = player.setName('A really long name with more than 50 characters wow');
      if (setNameResult.isOk) throw 'Expected an error';

      expect(setNameResult.error.code).toEqual('ValidationError');
    });
  });

  describe('setConnected', () => {
    it('sets the player connection status', () => {
      const player = createPlayer({ name: 'Name', isConnected: true });

      player.setConnected(false);

      expect(player.getIsConnected()).toEqual(false);
    });
  });
});
