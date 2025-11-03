import type { GameSessionDTO } from '../../dtos';

export class GameSessionRenamedEvent {
  public readonly type = 'GAME_SESSION_RENAMED';
  public readonly payload: {
    gameSession: GameSessionDTO;
  };

  constructor({ gameSession }: { gameSession: GameSessionDTO }) {
    this.payload = { gameSession };
  }
}
