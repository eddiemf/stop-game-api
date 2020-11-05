export interface IGameSessionRepository {
  save: (gameSessionData: { hash: string; name: string }) => Promise<void>;
  findByHash: (hash: string) => Promise<{ hash: string; name: string } | void>;
}

export const makeGameSessionRepository = (): IGameSessionRepository => {
  const gameSessions: Record<string, { hash: string; name: string }> = {};

  const findByHash = async (hash: string) => {
    return gameSessions[hash] || null;
  };

  const save = async (gameSessionData: { hash: string; name: string }) => {
    gameSessions[gameSessionData.hash] = gameSessionData;
  };

  return {
    findByHash,
    save,
  };
};
