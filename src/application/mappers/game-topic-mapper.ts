import { GameTopic } from '@app/domain';
import type { GameTopicDTO } from '@app/dtos';

export function gameTopicToDTO(topic: GameTopic): GameTopicDTO {
  return {
    id: topic.id,
    name: topic.name,
  };
}

export class GameTopicMapper {
  // public static toPersistence(topic: IGameTopicEntity): IGameTopicData {
  //   return {
  //     id: topic.id,
  //     name: topic.name,
  //   };
  // }

  public static toEntity(topicData: any): GameTopic | null {
    const result = GameTopic.create({
      id: topicData.id,
      name: topicData.name,
    });

    if (!result.isOk) return null;

    return result.data;
  }
}
