import cuid from 'cuid';
import { inputErrors } from '../../constants';
import { validate } from '../../core';
import { appendToList, insertToList, removeFromList } from '../../utils';

interface ITopic {
  id: string;
  name: string;
}

interface IPlayer {
  id: string;
  name: string;
}

interface IGameSessionProps {
  hash?: string;
  name: string;
  topics?: ITopic[];
  players?: IPlayer[];
}

export interface IGameSession {
  getHash: () => string;
  getName: () => string;
  rename: (newName: string) => void;
  getTopics: () => ITopic[];
  addTopic: (topic: ITopic) => void;
  removeTopic: (topicId: string) => void;
  renameTopic: (topicId: string, newName: string) => void;
  getPlayers: () => IPlayer[];
  addPlayer: (player: IPlayer) => void;
  removePlayer: (playerId: string) => void;
}

export interface IMakeGameSession {
  (props: IGameSessionProps): IGameSession;
}

const validationConstraints = {
  hash: { type: 'string' },
  name: { type: 'string', length: { minimum: 2, maximum: 30 } },
  topicId: { type: 'string' },
  topicName: { type: 'string', length: { minimum: 2, maximum: 30 } },
  playerName: { type: 'string', length: { minimum: 2, maximum: 30 } },
};

export const makeGameSession: IMakeGameSession = ({
  hash = cuid.slug(),
  name,
  topics = [],
  players = [],
}): IGameSession => {
  const error = validate({ hash, name }, validationConstraints);
  if (error) throw error;

  const getHash = () => hash;
  const getName = () => name;

  const rename = (newName: string) => {
    const error = validate({ name: newName }, validationConstraints);
    if (error) throw error;

    name = newName;
  };

  const getTopics = () => topics;
  const addTopic = (topic: ITopic) => {
    const error = validate({ topicName: topic.name }, validationConstraints);
    if (error) throw error;

    if (topics.find(({ id }) => topic.id === id)) throw inputErrors.TOPIC_ALREADY_IN_GAME_SESSION;

    topics = appendToList(topics, topic);
  };

  const removeTopic = (topicId: string) => {
    const topicIndex = topics.findIndex(({ id }) => id === topicId);
    if (topicIndex === -1) throw inputErrors.TOPIC_NOT_FOUND;

    topics = removeFromList(topics, topicIndex);
  };

  const renameTopic = (topicId: string, newName: string) => {
    const error = validate({ topicName: newName }, validationConstraints);
    if (error) throw error;

    const topic = topics.find(({ id }) => id === topicId);
    if (!topic) throw inputErrors.TOPIC_NOT_FOUND;

    const topicIndex = topics.findIndex(({ id }) => id === topicId);
    const newTopic = { ...topic, name: newName };
    removeTopic(topicId);
    topics = insertToList(topics, newTopic, topicIndex);
  };

  const getPlayers = () => players;

  const addPlayer = (player: IPlayer) => {
    const error = validate({ playerName: player.name }, validationConstraints);
    if (error) throw error;

    if (players.find(({ id }) => player.id === id))
      throw inputErrors.PLAYER_ALREADY_IN_GAME_SESSION;

    players = appendToList(players, player);
  };

  const removePlayer = (playerId: string) => {
    const playerIndex = players.findIndex(({ id }) => id === playerId);
    if (playerIndex === -1) throw inputErrors.PLAYER_NOT_FOUND;

    players = removeFromList(players, playerIndex);
  };

  return {
    getHash,
    getName,
    rename,
    getTopics,
    addTopic,
    removeTopic,
    renameTopic,
    getPlayers,
    addPlayer,
    removePlayer,
  };
};
