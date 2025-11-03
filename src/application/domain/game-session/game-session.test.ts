import { describe, expect, it } from 'vitest';
import { GameTopic } from '../game-topic';
import { Player } from '../player';
import { GameSession, GameSessionState } from './game-session';

const createGameSession = (props: any) => {
  const result = GameSession.create(props);
  if (!result.isOk) throw 'Expected a valid result';

  return result.data;
};

const createGameTopic = (props: any) => {
  const result = GameTopic.create(props);
  if (!result.isOk) throw 'Expected a valid result';

  return result.data;
};

const createPlayer = (props: any) => {
  const result = Player.create(props);
  if (!result.isOk) throw 'Expected a valid result';

  return result.data;
};

describe('GameSession', () => {
  describe('create', () => {
    it('creates a game session with a random slug id if `id` is not given', () => {
      const gameSession = createGameSession({ name: 'New session' });

      expect(gameSession.getId()).toEqual(expect.stringMatching(/^[a-zA-Z0-9+/=]{5}$/));
    });

    it('returns a validation error if `name` has less than 2 characters', () => {
      const result = GameSession.create({ name: 'a' });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a validation error if `name` has more than 30 characters', () => {
      const result = GameSession.create({
        name: 'A long name with more than 30 characters',
      });
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('ValidationError');
    });

    it('creates a game session with state set to `lobby` when a state is not given', () => {
      const gameSession = createGameSession({ name: 'Some name' });

      expect(gameSession.getState()).toEqual(GameSessionState.lobby);
    });
  });

  describe('rename', () => {
    it('renames the game session', () => {
      const gameSession = createGameSession({ name: 'Some name' });

      gameSession.rename('another name');

      expect(gameSession.getName()).toEqual('another name');
    });

    it('returns a validation error if the given name is shorter than 2 characters', () => {
      const gameSession = createGameSession({ name: 'Some name' });

      const result = gameSession.rename('a');

      if (result.isOk) throw 'Expected an error';
      expect(result.error.code).toEqual('ValidationError');
    });

    it('returns a validation error if the given name is bigger than 30 characters', () => {
      const gameSession = createGameSession({ name: 'Some name' });

      const result = gameSession.rename('another really gigantic big name');

      if (result.isOk) throw 'Expected an error';
      expect(result.error.code).toEqual('ValidationError');
    });
  });

  describe('addTopic', () => {
    it('returns a GameSessionNotInLobbyError error if the session state is not `lobby`', () => {
      const gameSession = createGameSession({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
      });
      const gameTopic = createGameTopic({ name: 'Some name' });

      const result = gameSession.addTopic(gameTopic);
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('GameSessionNotInLobbyError');
    });

    it('returns a TopicAlreadyInGameSessionError error if the topic is already in the game session', () => {
      const gameTopic = createGameTopic({ name: 'Topic' });
      const gameSession = createGameSession({ name: 'Session', topics: [gameTopic] });

      const result = gameSession.addTopic(gameTopic);
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('TopicAlreadyInGameSessionError');
    });

    it('adds a topic to the game session', () => {
      const gameTopic = createGameTopic({ name: 'Topic' });
      const gameSession = createGameSession({ name: 'Session' });

      gameSession.addTopic(gameTopic);

      expect(gameSession.getTopics()).toEqual([gameTopic]);
    });
  });

  describe('removeTopic', () => {
    it('returns a GameSessionNotInLobbyError error if the session state is not `lobby`', () => {
      const gameSession = createGameSession({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
      });

      const result = gameSession.removeTopic('topicId');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('GameSessionNotInLobbyError');
    });

    it('returns a TopicNotFoundError error if the topic is not in the game session', () => {
      const gameSession = createGameSession({ name: 'Session' });

      const result = gameSession.removeTopic('topicId');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('TopicNotFoundError');
    });

    it('removes a topic from the game session', () => {
      const gameTopic = createGameTopic({ id: 'topicId', name: 'Topic 1' });
      const gameTopic2 = createGameTopic({ id: 'topicId2', name: 'Topic 2' });
      const gameSession = createGameSession({
        name: 'Session',
        topics: [gameTopic, gameTopic2],
      });

      gameSession.removeTopic('topicId');

      expect(gameSession.getTopics()).toEqual([gameTopic2]);
    });
  });

  describe('renameTopic', () => {
    it('returns a GameSessionNotInLobbyError error if the session state is not `lobby`', () => {
      const gameSession = createGameSession({
        name: 'Some name',
        state: GameSessionState.matchInProgress,
      });

      const result = gameSession.renameTopic('topicId', 'new name');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('GameSessionNotInLobbyError');
    });

    it('returns a TopicNotFoundError error if the topic is not in the game session', () => {
      const gameSession = createGameSession({ name: 'Session' });

      const result = gameSession.renameTopic('topicId', 'new name');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('TopicNotFoundError');
    });

    it('renames a topic from the game session', () => {
      const gameTopic = createGameTopic({ id: 'topicId', name: 'Topic 1' });
      const gameTopic2 = createGameTopic({ id: 'topicId2', name: 'Topic 2' });
      const gameSession = createGameSession({
        name: 'Session',
        topics: [gameTopic, gameTopic2],
      });

      gameSession.renameTopic('topicId', 'new name');

      expect(gameSession.getTopics()[0].getName()).toEqual('new name');
    });
  });

  describe('addPlayer', () => {
    it('adds a player to the game session', () => {
      const gameSession = createGameSession({ name: 'Some name' });
      const player = createPlayer({ id: 'id', name: 'Some name' });

      gameSession.addPlayer(player);

      expect(gameSession.getPlayers()).toEqual([player]);
    });

    it('returns a PlayerAlreadyInGameSessionError error if the player is connected to the game session', () => {
      const gameSession = createGameSession({ name: 'Some name' });
      const player = createPlayer({ id: 'id', name: 'Some name', isConnected: true });

      gameSession.addPlayer(player);

      const result = gameSession.addPlayer(player);
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('PlayerAlreadyInGameSessionError');
    });

    it('sets the player to connected if it is already in the game session but not connected', () => {
      const player = createPlayer({ id: 'id', name: 'Some name', isConnected: false });
      const gameSession = createGameSession({ name: 'Some name', players: [player] });

      gameSession.addPlayer(player); // Player reconnecting

      expect(gameSession.getPlayers()[0].getIsConnected()).toEqual(true);
    });
  });

  describe('removePlayer', () => {
    it('removes a player from the game session', () => {
      const player = createPlayer({ userId: 'userId', name: 'Some name' });
      const player2 = createPlayer({ userId: 'userId2', name: 'Some name' });
      const gameSession = createGameSession({
        name: 'Some name',
        players: [player, player2],
      });

      gameSession.removePlayer('userId');

      expect(gameSession.getPlayers()).toEqual([player2]);
    });

    it('returns a PlayerNotInSessionError error if the player is not in the game session', () => {
      const gameSession = createGameSession({ name: 'Some name' });

      const result = gameSession.removePlayer('id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('PlayerNotInSessionError');
    });
  });

  describe('disconnectPlayer', () => {
    it('returns a PlayerNotInSessionError error if the player is not in the game session', () => {
      const gameSession = createGameSession({ name: 'Some name' });

      const result = gameSession.disconnectPlayer('invalid-player-id');
      if (result.isOk) throw 'Expected an error';

      expect(result.error.code).toEqual('PlayerNotInSessionError');
    });

    it('disconnects a player from the game session', () => {
      const player = createPlayer({ userId: 'userId', name: 'Some name', isConnected: true });
      const player2 = createPlayer({ userId: 'userId2', name: 'Some name', isConnected: true });
      const gameSession = createGameSession({
        name: 'Some name',
        players: [player, player2],
      });

      gameSession.disconnectPlayer('userId');

      expect(gameSession.getPlayers()[0].getIsConnected()).toEqual(false);
      expect(gameSession.getPlayers()[1].getIsConnected()).toEqual(true);
    });
  });

  describe('setState', () => {
    it('sets the session state to the given value', () => {
      const gameSession = createGameSession({ name: 'Some name' });

      gameSession.setState(GameSessionState.matchInProgress);

      expect(gameSession.getState()).toEqual(GameSessionState.matchInProgress);
    });
  });
});
