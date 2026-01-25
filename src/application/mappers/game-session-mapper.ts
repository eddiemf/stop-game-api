import type { GameSession } from '@app/domain';
import type { GameSessionDTO } from '@app/dtos';
import { gameTopicToDTO } from './game-topic-mapper';
import { playerToDTO } from './player-mapper';

export function gameSessionToDTO(gameSession: GameSession): GameSessionDTO {
  return {
    id: gameSession.id,
    name: gameSession.name,
    topics: gameSession.topics.map(gameTopicToDTO),
    players: gameSession.players.map(playerToDTO),
    state: gameSession.state,
  };
}
