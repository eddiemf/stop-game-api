import type { Player } from "@app/domain";
import type { PlayerDTO } from "@app/dtos";

export function playerToDTO(player: Player): PlayerDTO {
  return {
    id: player.id,
    userId: player.userId,
    name: player.name,
    isConnected: player.isConnected,
  };
}
