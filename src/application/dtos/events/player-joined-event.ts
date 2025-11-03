import type { GameSessionDTO, PlayerDTO } from '../../dtos';

export class PlayerJoinedEvent {
  public readonly type = 'PLAYER_JOINED';
  public readonly payload: {
    player: PlayerDTO;
    gameSession: GameSessionDTO;
  };

  constructor({ player, gameSession }: { player: PlayerDTO; gameSession: GameSessionDTO }) {
    this.payload = { player, gameSession };
  }
}
