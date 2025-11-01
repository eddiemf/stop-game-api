import { Player } from '@app/domain';
import type { PlayerDTO } from '@app/dtos';

export class PlayerMapper {
  // public static toPersistence(player: IPlayerEntity): IPlayerData {
  //   return {
  //     id: player.id,
  //     name: player.name,
  //     isConnected: player.isConnected,
  //   };
  // }

  public static toEntity(playerData: any): Player | null {
    const result = Player.create({
      id: playerData.id,
      name: playerData.name,
      isConnected: playerData.isConnected,
    });

    if (!result.isOk) return null;

    return result.data;
  }

  public static toDTO(player: Player): PlayerDTO {
    return {
      id: player.getId(),
      name: player.getName(),
      isConnected: player.getIsConnected(),
    };
  }
}
