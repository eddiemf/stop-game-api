import type { GameTopic } from '@app/domain';
import type { GameTopicDTO } from '@app/dtos';

export function gameTopicToDTO(topic: GameTopic): GameTopicDTO {
  return {
    id: topic.id,
    name: topic.name,
  };
}
