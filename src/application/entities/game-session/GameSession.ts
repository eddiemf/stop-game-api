import cuid from 'cuid';
import { validate } from '../../core';

interface IGameSessionProps {
  hash?: string;
  name: string;
}

export interface IGameSession {
  getHash: () => string;
  getName: () => string;
}

export interface IMakeGameSession {
  (props: IGameSessionProps): IGameSession;
}

const validationConstraints = {
  hash: { type: 'string' },
  name: { type: 'string', length: { minimum: 2, maximum: 30 } },
};

export const makeGameSession: IMakeGameSession = ({ hash = cuid.slug(), name }): IGameSession => {
  const error = validate({ hash, name }, validationConstraints);
  if (error) throw error;

  const getHash = () => hash;
  const getName = () => name;

  return {
    getHash,
    getName,
  };
};
