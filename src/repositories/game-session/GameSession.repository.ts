interface ITopicData {
  id: string;
  name: string;
}

interface IGameSessionData {
  hash: string;
  name: string;
  topics: ITopicData[];
}

export interface IGameSessionRepository {
  save: (gameSessionData: IGameSessionData) => Promise<void>;
  findByHash: (hash: string) => Promise<IGameSessionData | void>;
}

export const makeGameSessionRepository = (): IGameSessionRepository => {
  const gameSessions: Record<string, IGameSessionData> = {};

  const findByHash = async (hash: string) => {
    return gameSessions[hash] || null;
  };

  const save = async (gameSessionData: IGameSessionData) => {
    gameSessions[gameSessionData.hash] = gameSessionData;
  };

  return {
    findByHash,
    save,
  };
};
