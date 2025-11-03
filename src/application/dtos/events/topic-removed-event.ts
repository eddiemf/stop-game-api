import type { GameSessionDTO, GameTopicDTO } from '../../dtos';

export class TopicRemovedEvent {
  public readonly type = 'TOPIC_REMOVED';
  public readonly payload: {
    topic: GameTopicDTO;
    gameSession: GameSessionDTO;
  };

  constructor({ gameSession, topic }: { gameSession: GameSessionDTO; topic: GameTopicDTO }) {
    this.payload = { gameSession, topic };
  }
}
