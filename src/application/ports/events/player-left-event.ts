import type { GameSessionDTO, PlayerDTO } from '../dtos';

export class PlayerLeftEvent {
  public readonly type = 'PLAYER_LEFT';
  public readonly payload: {
    player: PlayerDTO;
    gameSession: GameSessionDTO;
  };

  constructor({ player, gameSession }: { player: PlayerDTO; gameSession: GameSessionDTO }) {
    this.payload = { player, gameSession };
  }
}
