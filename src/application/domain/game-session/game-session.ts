import { Id } from '@shared/id';
import { Fail, Ok, type Result } from '@shared/result';
import { ValidationError } from '../errors/validation-error';
import type { GameTopic } from '../game-topic';
import type { Player } from '../player';
import {
  GameSessionNotInLobbyError,
  PlayerAlreadyInGameSessionError,
  PlayerNotInSessionError,
  TopicAlreadyInGameSessionError,
  TopicNotFoundError,
} from './game-session-errors';

interface Props {
  id?: string;
  name: string;
  topics?: GameTopic[];
  players?: Player[];
  state?: GameSessionState;
}

export enum GameSessionState {
  lobby = 'lobby',
  matchInProgress = 'match-in-progress',
  matchFinished = 'match-finished',
}

export class GameSession {
  private constructor(
    private id: string,
    private name: string,
    private topics: GameTopic[],
    private players: Player[],
    private state: GameSessionState
  ) {}

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getTopics(): GameTopic[] {
    return this.topics;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getState(): GameSessionState {
    return this.state;
  }

  public getProps(): Props {
    return {
      id: this.id,
      name: this.name,
      topics: this.topics,
      players: this.players,
      state: this.state,
    };
  }

  public rename(newName: string): Result<void, ValidationError> {
    const nameResult = GameSession.validateName(newName);
    if (!nameResult.isOk) return Fail(nameResult.error);

    this.name = newName;

    return Ok(undefined);
  }

  public addTopic(
    newTopic: GameTopic
  ): Result<void, GameSessionNotInLobbyError | TopicAlreadyInGameSessionError> {
    if (this.state !== GameSessionState.lobby)
      return Fail(new GameSessionNotInLobbyError('Could not add topic'));

    if (this.topics.find((topic) => newTopic.getId() === topic.getId()))
      return Fail(new TopicAlreadyInGameSessionError('Could not add topic'));

    this.topics = this.topics.concat(newTopic);

    return Ok(undefined);
  }

  public removeTopic(
    topicId: string
  ): Result<void, GameSessionNotInLobbyError | TopicNotFoundError> {
    if (this.state !== GameSessionState.lobby)
      return Fail(new GameSessionNotInLobbyError('Could not remove topic'));

    const topicIndex = this.topics.findIndex((topic) => topic.getId() === topicId);
    if (topicIndex === -1) return Fail(new TopicNotFoundError('Could not remove topic'));

    this.topics = this.topics.filter((topic) => topic.getId() !== topicId);

    return Ok(undefined);
  }

  public renameTopic(
    topicId: string,
    newName: string
  ): Result<void, GameSessionNotInLobbyError | TopicNotFoundError | ValidationError> {
    if (this.state !== GameSessionState.lobby)
      return Fail(new GameSessionNotInLobbyError('Could not rename topic'));

    const topic = this.topics.find((topic) => topic.getId() === topicId);
    if (!topic) return Fail(new TopicNotFoundError('Could not rename topic'));

    const result = topic.setName(newName);
    if (!result.isOk) return Fail(result.error);

    return Ok(undefined);
  }

  public addPlayer(newPlayer: Player): Result<void, PlayerAlreadyInGameSessionError> {
    const player = this.players.find((player) => player.getId() === newPlayer.getId());
    if (!player) {
      this.players = this.players.concat(newPlayer);

      return Ok(undefined);
    }

    if (player.getIsConnected())
      return Fail(new PlayerAlreadyInGameSessionError('Could not add player'));

    player.setConnected(true);

    return Ok(undefined);
  }

  public removePlayer(playerId: string): Result<void, PlayerNotInSessionError> {
    const playerIndex = this.players.findIndex((player) => player.getId() === playerId);
    if (playerIndex === -1) return Fail(new PlayerNotInSessionError('Could not remove player'));

    this.players = this.players.filter((player) => player.getId() !== playerId);

    return Ok(undefined);
  }

  public disconnectPlayer(playerId: string): Result<void, PlayerNotInSessionError> {
    const player = this.players.find((player) => player.getId() === playerId);
    if (!player) return Fail(new PlayerNotInSessionError('Could not disconnect player'));

    player.setConnected(false);

    return Ok(undefined);
  }

  public setState(newState: GameSessionState) {
    this.state = newState;
  }

  public static create({
    id = Id.createSlug(),
    name,
    topics = [],
    players = [],
    state = GameSessionState.lobby,
  }: Props): Result<GameSession, ValidationError> {
    const nameResult = GameSession.validateName(name);
    if (!nameResult.isOk) return Fail(nameResult.error);

    return Ok(new GameSession(id, name, topics, players, state));
  }

  private static validateName(name: string): Result<string, ValidationError> {
    if (!name) return Fail(new ValidationError('name', 'Name is required and cannot be empty.'));
    if (typeof name !== 'string')
      return Fail(new ValidationError('name', 'Name must be a string.'));
    if (name.length < 2 || name.length > 30)
      return Fail(new ValidationError('name', 'Name must be between 2 and 30 characters long.'));

    return Ok(name);
  }
}
