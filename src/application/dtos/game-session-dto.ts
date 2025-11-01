import type { GameSessionState } from '@app/domain';
import type { GameTopicDTO } from './game-topic-dto';
import type { PlayerDTO } from './player-dto';

export interface GameSessionDTO {
  id: string;
  name: string;
  topics: GameTopicDTO[];
  players: PlayerDTO[];
  state: GameSessionState;
}
