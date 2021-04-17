import cuid from 'cuid';
import { ITopicData } from '../../../repositories/game-session/GameSession.repository';
import { validate } from '../../core';

interface ITopicProps {
  id?: string;
  name: string;
  value?: string;
}

export interface ITopic {
  getId: () => string;
  getName: () => string;
  setName: (name: string) => void;
  getValue: () => string;
  setValue: (value: string) => void;
  getData: () => ITopicData;
}

export interface IMakeTopic {
  (props: ITopicProps): ITopic;
}

const validationConstraints = {
  id: { type: 'string' },
  name: { type: 'string', length: { minimum: 2, maximum: 50 } },
  value: { type: 'string', length: { maximum: 50 } },
};

export const makeTopic: IMakeTopic = ({ id = cuid.slug(), name, value = '' }): ITopic => {
  const error = validate({ id, name, value }, validationConstraints);
  if (error) throw error;

  const getId = () => id;
  const getName = () => name;
  const getValue = () => value;

  const setName = (newName: string) => {
    const error = validate({ name: newName }, validationConstraints);
    if (error) throw error;

    name = newName;
  };

  const setValue = (newValue: string) => {
    const error = validate({ value: newValue }, validationConstraints);
    if (error) throw error;

    value = newValue;
  };

  const getData = () => ({
    id: getId(),
    name: getName(),
    value: getValue(),
  });

  return { getId, getName, getValue, setValue, setName, getData };
};
