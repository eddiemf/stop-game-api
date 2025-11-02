import type { GameSessionDTO, GameTopicDTO } from '../dtos';

export class TopicRenamedEvent {
  public readonly type = 'TOPIC_RENAMED';
  public readonly payload: {
    topic: GameTopicDTO;
    gameSession: GameSessionDTO;
  };

  constructor({ gameSession, topic }: { gameSession: GameSessionDTO; topic: GameTopicDTO }) {
    this.payload = { gameSession, topic };
  }
}
