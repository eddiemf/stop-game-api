import { describe, expect, it } from 'vitest';
import { GameTopic } from '../game-topic';
import { Player } from '../player';
import { GameSession, GameSessionState } from './game-session';

describe('GameSession', () => {
  describe('create', () => {
    it('creates a game session with a random slug id if `id` is not given', () => {
      const gameSession = GameSession.create({ name: 'New session' }).getData();

      expect(gameSession.id).toEqual(expect.stringMatching(/^[a-zA-Z0-9+/=]{5}$/));
    });

    it('returns a ValidationError if `name` is undefined', () => {
      // @ts-expect-error
      const result = GameSession.create({ name: undefined });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if `name` is not a string', () => {
      // @ts-expect-error
      const result = GameSession.create({ name: 123 });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if `name` has less than 2 characters', () => {
      const result = GameSession.create({ name: 'a' });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if `name` has more than 30 characters', () => {
      const result = GameSession.create({
        name: 'A long name with more than 30 characters',
      });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('creates a game session with state set to `lobby` when a state is not given', () => {
      const gameSession = GameSession.create({ name: 'Some name' }).getData();

      expect(gameSession.state).toEqual(GameSessionState.lobby);
    });
  });

  describe('rename', () => {
    it('renames the game session', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameSession = GameSession.create({ name: 'Some name', players: [player] }).getData();

      const result = gameSession.rename('another name', 'user-id');
      if (!result.isOk) throw 'Expected a valid result';

      expect(gameSession.name).toEqual('another name');
    });

    it('returns a UserNotInGameSessionError if the user is not in the game session', () => {
      const gameSession = GameSession.create({ name: 'Some name' }).getData();

      const result = gameSession.rename('a', 'invalid-user-id');

      if (result.isOk) throw 'Expected an error';
      expect(result.error.code).toEqual('UserNotInGameSessionError');
    });

    it('returns a ValidationError if the given name is shorter than 2 characters', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameSession = GameSession.create({ name: 'Some name', players: [player] }).getData();

      const result = gameSession.rename('a', 'user-id');

      if (result.isOk) throw 'Expected an error';
      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a ValidationError if the given name is bigger than 30 characters', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameSession = GameSession.create({ name: 'Some name', players: [player] }).getData();

      const result = gameSession.rename('another really gigantic big name', 'user-id');

      if (result.isOk) throw 'Expected an error';
      expect(result.error.code).toEqual('ValidationError');
    });
  });

  describe('addTopic', () => {
    it('returns a UserNotInGameSessionError if the user is not in the game session', () => {
      const gameSession = GameSession.create({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
        players: [],
      }).getData();
      const gameTopic = GameTopic.create({ name: 'Some name' }).getData();

      const result = gameSession.addTopic(gameTopic, 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('UserNotInGameSessionError');
    });

    it('returns a GameSessionNotInLobbyError if the session state is not `lobby`', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameSession = GameSession.create({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
        players: [player],
      }).getData();
      const gameTopic = GameTopic.create({ name: 'Some name' }).getData();

      const result = gameSession.addTopic(gameTopic, 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('GameSessionNotInLobbyError');
    });

    it('returns a TopicAlreadyInGameSessionError if the topic is already in the game session', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameTopic = GameTopic.create({ name: 'Topic' }).getData();
      const gameSession = GameSession.create({
        name: 'Session',
        topics: [gameTopic],
        players: [player],
      }).getData();
      const result = gameSession.addTopic(gameTopic, 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('TopicAlreadyInGameSessionError');
    });

    it('adds a topic to the game session', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameTopic = GameTopic.create({ name: 'Topic' }).getData();
      const gameSession = GameSession.create({ name: 'Session', players: [player] }).getData();

      gameSession.addTopic(gameTopic, 'user-id');

      expect(gameSession.topics).toEqual([gameTopic]);
    });
  });

  describe('removeTopic', () => {
    it('returns a UserNotInGameSessionError if the user is not in the game session', () => {
      const gameSession = GameSession.create({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
      }).getData();
      const result = gameSession.removeTopic('topicId', 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('UserNotInGameSessionError');
    });

    it('returns a GameSessionNotInLobbyError if the session state is not `lobby`', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameSession = GameSession.create({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
        players: [player],
      }).getData();

      const result = gameSession.removeTopic('topicId', 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('GameSessionNotInLobbyError');
    });

    it('returns a TopicNotFoundError if the topic is not in the game session', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameSession = GameSession.create({ name: 'Session', players: [player] }).getData();

      const result = gameSession.removeTopic('topicId', 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('TopicNotFoundError');
    });

    it('removes a topic from the game session', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameTopic = GameTopic.create({ name: 'Topic 1' }).getData();
      const gameTopic2 = GameTopic.create({ name: 'Topic 2' }).getData();
      const gameSession = GameSession.create({
        name: 'Session',
        topics: [gameTopic, gameTopic2],
        players: [player],
      }).getData();
      gameSession.removeTopic('Topic 1', 'user-id');

      expect(gameSession.topics).toEqual([gameTopic2]);
    });
  });

  describe('renameTopic', () => {
    it('returns a UserNotInGameSessionError if the user is not in the game session', () => {
      const gameSession = GameSession.create({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
      }).getData();

      const result = gameSession.renameTopic('topicId', 'new name', 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('UserNotInGameSessionError');
    });

    it('returns a GameSessionNotInLobbyError if the session state is not `lobby`', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameSession = GameSession.create({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
        players: [player],
      }).getData();
      const result = gameSession.renameTopic('topicId', 'new name', 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('GameSessionNotInLobbyError');
    });

    it('returns a TopicNotFoundError if the topic is not in the game session', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameSession = GameSession.create({ name: 'Session', players: [player] }).getData();

      const result = gameSession.renameTopic('topicId', 'new name', 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('TopicNotFoundError');
    });

    it('returns a TopicNameAlreadyInSessionError if there is already a topic with the same name', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameTopic = GameTopic.create({ id: 'topicId', name: 'Topic 1' }).getData();
      const gameTopic2 = GameTopic.create({ id: 'topicId2', name: 'Topic 2' }).getData();
      const gameSession = GameSession.create({
        name: 'Session',
        topics: [gameTopic, gameTopic2],
        players: [player],
      }).getData();
      const result = gameSession.renameTopic('topicId', 'Topic 2', 'user-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('TopicNameAlreadyInSessionError');
    });

    it('renames a topic from the game session', () => {
      const player = Player.create({ userId: 'user-id', name: 'Some name' }).getData();
      const gameTopic = GameTopic.create({ id: 'topicId', name: 'Topic 1' }).getData();
      const gameTopic2 = GameTopic.create({ id: 'topicId2', name: 'Topic 2' }).getData();
      const gameSession = GameSession.create({
        name: 'Session',
        topics: [gameTopic, gameTopic2],
        players: [player],
      }).getData();
      gameSession.renameTopic('topicId', 'new name', 'user-id');

      expect(gameSession.topics[0].name).toEqual('new name');
    });
  });

  describe('addPlayer', () => {
    it('adds a player to the game session', () => {
      const gameSession = GameSession.create({ name: 'Some name' }).getData();
      const player = Player.create({ userId: 'id', name: 'Some name' }).getData();

      gameSession.addPlayer(player);

      expect(gameSession.players).toEqual([player]);
    });

    it('returns a PlayerAlreadyInGameSessionError error if the player is connected to the game session', () => {
      const gameSession = GameSession.create({ name: 'Some name' }).getData();
      const player = Player.create({
        userId: 'id',
        name: 'Some name',
        isConnected: true,
      }).getData();

      gameSession.addPlayer(player);

      const result = gameSession.addPlayer(player);
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('PlayerAlreadyInGameSessionError');
    });

    it('sets the player to connected if it is already in the game session but not connected', () => {
      const player = Player.create({
        userId: 'id',
        name: 'Some name',
        isConnected: false,
      }).getData();
      const gameSession = GameSession.create({ name: 'Some name', players: [player] }).getData();

      gameSession.addPlayer(player); // Player reconnecting

      expect(gameSession.players[0].isConnected).toEqual(true);
    });
  });

  describe('removePlayer', () => {
    it('removes a player from the game session', () => {
      const player = Player.create({ userId: 'userId', name: 'Some name' }).getData();
      const player2 = Player.create({ userId: 'userId2', name: 'Some name' }).getData();
      const gameSession = GameSession.create({
        name: 'Some name',
        players: [player, player2],
      }).getData();

      gameSession.removePlayer('userId');

      expect(gameSession.players).toEqual([player2]);
    });

    it('returns a PlayerNotInSessionError error if the player is not in the game session', () => {
      const gameSession = GameSession.create({ name: 'Some name' }).getData();

      const result = gameSession.removePlayer('id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('PlayerNotInSessionError');
    });
  });

  describe('disconnectPlayer', () => {
    it('returns a PlayerNotInSessionError error if the player is not in the game session', () => {
      const gameSession = GameSession.create({ name: 'Some name' }).getData();

      const result = gameSession.disconnectPlayer('invalid-player-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('PlayerNotInSessionError');
    });

    it('disconnects a player from the game session', () => {
      const player = Player.create({
        userId: 'userId',
        name: 'Some name',
        isConnected: true,
      }).getData();
      const player2 = Player.create({
        userId: 'userId2',
        name: 'Some name',
        isConnected: true,
      }).getData();
      const gameSession = GameSession.create({
        name: 'Some name',
        players: [player, player2],
      }).getData();

      gameSession.disconnectPlayer('userId');

      expect(gameSession.players[0].isConnected).toEqual(false);
      expect(gameSession.players[1].isConnected).toEqual(true);
    });
  });

  describe('setState', () => {
    it('sets the session state to the given value', () => {
      const gameSession = GameSession.create({ name: 'Some name' }).getData();

      gameSession.setState(GameSessionState.matchInProgress);

      expect(gameSession.state).toEqual(GameSessionState.matchInProgress);
    });
  });
});
