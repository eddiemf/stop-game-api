import cuid from 'cuid';
import {
  IGameSessionData,
  ITopicData,
} from '../../../repositories/game-session/GameSession.repository';
import { inputErrors } from '../../constants';
import { validate } from '../../core';
import { appendToList, removeFromList } from '../../utils';
import { ITopic, makeTopic } from '../topic';

interface IPlayer {
  id: string;
  name: string;
}

interface IGameSessionProps {
  hash?: string;
  name: string;
  topics?: ITopicData[];
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
  getData: () => IGameSessionData;
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

  let _topics = topics.map((topic) => makeTopic(topic));

  const getHash = () => hash;
  const getName = () => name;

  const rename = (newName: string) => {
    const error = validate({ name: newName }, validationConstraints);
    if (error) throw error;

    name = newName;
  };

  const getTopics = () => _topics;

  const addTopic = (newTopic: ITopic) => {
    if (_topics.find((topic) => newTopic.getId() === topic.getId()))
      throw inputErrors.TOPIC_ALREADY_IN_GAME_SESSION;

    _topics = appendToList(_topics, newTopic);
  };

  const removeTopic = (topicId: string) => {
    const topicIndex = _topics.findIndex((topic) => topic.getId() === topicId);
    if (topicIndex === -1) throw inputErrors.TOPIC_NOT_FOUND;

    _topics = removeFromList(_topics, topicIndex);
  };

  const renameTopic = (topicId: string, newName: string) => {
    const topic = _topics.find((topic) => topic.getId() === topicId);
    if (!topic) throw inputErrors.TOPIC_NOT_FOUND;

    topic.setName(newName);
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

  const getData = () => ({
    hash: getHash(),
    name: getName(),
    topics: getTopics().map((topic) => topic.getData()),
    players: getPlayers(),
  });

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
    getData,
  };
};
