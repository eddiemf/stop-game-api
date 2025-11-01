import { AddTopic, RemoveTopic, RenameTopic } from '../../../../application/use-cases';
import {
  DATABASE_ERROR,
  GAME_SESSION_NOT_FOUND,
  GAME_SESSION_NOT_IN_LOBBY,
  INVALID_INPUT,
  TOPIC_ALREADY_IN_GAME_SESSION,
  TOPIC_NOT_FOUND,
} from '../../../../interfaces';
import type { AppRequest } from '../../../../interfaces/Controller';
import { gameSessionRepository } from '../../../../repositories';
import { GameSessionMapper } from '../../../application/mappers/GameSessionMapper';

export class GameTopicsController {
  public static async add({ params, body }: AppRequest) {
    const { sessionId } = params;
    const { name } = body;

    const result = await AddTopic.execute({
      sessionId,
      name,
      gameSessionRepository,
    });

    if (!result.isOk) {
      if (result.error === INVALID_INPUT) {
        return {
          status: 200,
          response: { error: INVALID_INPUT },
        };
      } else if (result.error === GAME_SESSION_NOT_FOUND) {
        return {
          status: 200,
          response: { error: GAME_SESSION_NOT_FOUND },
        };
      } else if (result.error === GAME_SESSION_NOT_IN_LOBBY) {
        return {
          status: 200,
          response: { error: GAME_SESSION_NOT_IN_LOBBY },
        };
      } else if (result.error === TOPIC_ALREADY_IN_GAME_SESSION) {
        return {
          status: 200,
          response: { error: TOPIC_ALREADY_IN_GAME_SESSION },
        };
      } else {
        return {
          status: 500,
          response: { error: DATABASE_ERROR },
        };
      }
    }

    return {
      status: 200,
      response: { gameSession: GameSessionMapper.toDTO(result.data) },
    };
  }

  public static async remove({ params }: AppRequest) {
    const { sessionId, topicId } = params;

    const result = await RemoveTopic.execute({
      sessionId,
      topicId,
      gameSessionRepository,
    });

    if (!result.isOk) {
      if (result.error === GAME_SESSION_NOT_IN_LOBBY) {
        return {
          status: 200,
          response: { error: GAME_SESSION_NOT_IN_LOBBY },
        };
      } else if (result.error === TOPIC_NOT_FOUND) {
        return {
          status: 200,
          response: { error: TOPIC_NOT_FOUND },
        };
      } else if (result.error === GAME_SESSION_NOT_FOUND) {
        return {
          status: 200,
          response: { error: GAME_SESSION_NOT_FOUND },
        };
      } else {
        return {
          status: 500,
          response: { error: DATABASE_ERROR },
        };
      }
    }

    return {
      status: 200,
      response: { gameSession: GameSessionMapper.toDTO(result.data) },
    };
  }

  public static async rename({ params, body }: AppRequest) {
    const { sessionId, topicId } = params;
    const { name } = body;

    const result = await RenameTopic.execute({
      sessionId,
      topicId,
      name,
      gameSessionRepository,
    });

    if (!result.isOk) {
      if (result.error === INVALID_INPUT) {
        return {
          status: 200,
          response: { error: INVALID_INPUT },
        };
      } else if (result.error === GAME_SESSION_NOT_FOUND) {
        return {
          status: 200,
          response: { error: GAME_SESSION_NOT_FOUND },
        };
      } else if (result.error === GAME_SESSION_NOT_IN_LOBBY) {
        return {
          status: 200,
          response: { error: GAME_SESSION_NOT_IN_LOBBY },
        };
      } else if (result.error === TOPIC_NOT_FOUND) {
        return {
          status: 200,
          response: { error: TOPIC_NOT_FOUND },
        };
      } else {
        return {
          status: 500,
          response: { error: DATABASE_ERROR },
        };
      }
    }

    return {
      status: 200,
      response: { gameSession: GameSessionMapper.toDTO(result.data) },
    };
  }
}
