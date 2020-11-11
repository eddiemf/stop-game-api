import cuid from 'cuid';
import { inputErrors } from '../../constants';
import { validate } from '../../core';
import { appendToList, insertToList, removeFromList } from '../../utils';

interface ITopic {
  id: string;
  name: string;
}

interface IGameSessionProps {
  hash?: string;
  name: string;
  topics?: ITopic[];
}

export interface IGameSession {
  getHash: () => string;
  getName: () => string;
  getTopics: () => ITopic[];
  addTopic: (topic: ITopic) => void;
  removeTopic: (topicId: string) => void;
  renameTopic: (topicId: string, newName: string) => void;
}

export interface IMakeGameSession {
  (props: IGameSessionProps): IGameSession;
}

const validationConstraints = {
  hash: { type: 'string' },
  name: { type: 'string', length: { minimum: 2, maximum: 30 } },
  topicId: { type: 'string' },
  topicName: { type: 'string', length: { minimum: 2, maximum: 30 } },
};

export const makeGameSession: IMakeGameSession = ({
  hash = cuid.slug(),
  name,
  topics = [],
}): IGameSession => {
  const error = validate({ hash, name }, validationConstraints);
  if (error) throw error;

  const getHash = () => hash;
  const getName = () => name;
  const getTopics = () => topics;
  const addTopic = (topic: ITopic) => {
    const error = validate({ topicName: topic.name }, validationConstraints);
    if (error) throw error;

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

  return {
    getHash,
    getName,
    getTopics,
    addTopic,
    removeTopic,
    renameTopic,
  };
};
