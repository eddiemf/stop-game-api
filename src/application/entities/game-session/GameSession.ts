import Joi from '@hapi/joi';
import cuid from 'cuid';
import { JoiErrorParser } from '../../core';

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

const GameSessionSchema = Joi.object({
  hash: Joi.string(),
  name: Joi.string().min(2).max(30),
});

export const makeGameSession: IMakeGameSession = ({ hash = cuid.slug(), name }): IGameSession => {
  const { error } = GameSessionSchema.validate({ hash, name });
  if (error) throw new Error(JoiErrorParser.getErrorKey(error));

  const getHash = () => hash;
  const getName = () => name;

  return {
    getHash,
    getName,
  };
};
