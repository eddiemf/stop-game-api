import { GameSession } from '@app/domain';
import type { GameSessionDTO } from '@app/dtos';
import { GameTopicMapper } from './game-topic-mapper';
import { PlayerMapper } from './player-mapper';

export class GameSessionMapper {
  public static toEntity(gameSessionData: any): GameSession | null {
    const result = GameSession.create({
      id: gameSessionData.id,
      name: gameSessionData.name,
      topics: gameSessionData.topics.map(GameTopicMapper.toEntity),
      // .filter((topic) => !!topic) as IGameTopicEntity[],
      players: gameSessionData.players.map(PlayerMapper.toEntity),
      // .filter((player) => !!player) as IPlayerEntity[],
      state: gameSessionData.state,
    });

    if (!result.isOk) return null;

    return result.data;
  }

  public static toDTO(gameSession: GameSession): GameSessionDTO {
    return {
      id: gameSession.getId(),
      name: gameSession.getName(),
      topics: gameSession.getTopics().map(GameTopicMapper.toDTO),
      players: gameSession.getPlayers().map(PlayerMapper.toDTO),
      state: gameSession.getState(),
    };
  }
}
