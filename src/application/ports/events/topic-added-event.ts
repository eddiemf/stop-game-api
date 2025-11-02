import type { GameSessionDTO, GameTopicDTO } from '../dtos';

export class TopicAddedEvent {
  public readonly type = 'TOPIC_ADDED';
  public readonly payload: {
    topic: GameTopicDTO;
    gameSession: GameSessionDTO;
  };

  constructor({ gameSession, topic }: { gameSession: GameSessionDTO; topic: GameTopicDTO }) {
    this.payload = { gameSession, topic };
  }
}
