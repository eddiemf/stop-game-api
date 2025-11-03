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
  UserNotInGameSessionError,
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

  public rename(
    newName: string,
    userId: string
  ): Result<GameSession, ValidationError | UserNotInGameSessionError> {
    if (!this.isUserInSession(userId))
      return Fail(new UserNotInGameSessionError('Could not rename game session'));

    const nameResult = GameSession.validateName(newName);
    if (!nameResult.isOk) return Fail(nameResult.error);

    this.name = newName;

    return Ok(this);
  }

  public addTopic(
    newTopic: GameTopic,
    userId: string
  ): Result<
    void,
    UserNotInGameSessionError | GameSessionNotInLobbyError | TopicAlreadyInGameSessionError
  > {
    if (!this.isUserInSession(userId))
      return Fail(new UserNotInGameSessionError('Could not add topic'));

    if (this.state !== GameSessionState.lobby)
      return Fail(new GameSessionNotInLobbyError('Could not add topic'));

    if (this.topics.find((topic) => newTopic.getId() === topic.getId()))
      return Fail(new TopicAlreadyInGameSessionError('Could not add topic'));

    this.topics = this.topics.concat(newTopic);

    return Ok(undefined);
  }

  public removeTopic(
    topicId: string,
    userId: string
  ): Result<
    GameTopic,
    UserNotInGameSessionError | GameSessionNotInLobbyError | TopicNotFoundError
  > {
    if (!this.isUserInSession(userId))
      return Fail(new UserNotInGameSessionError('Could not remove topic'));

    if (this.state !== GameSessionState.lobby)
      return Fail(new GameSessionNotInLobbyError('Could not remove topic'));

    const topicIndex = this.topics.findIndex((topic) => topic.getId() === topicId);
    if (topicIndex === -1) return Fail(new TopicNotFoundError('Could not remove topic'));

    const topic = this.topics[topicIndex];
    this.topics = this.topics.filter((topic) => topic.getId() !== topicId);

    return Ok(topic);
  }

  public renameTopic(
    topicId: string,
    newName: string,
    userId: string
  ): Result<
    GameTopic,
    UserNotInGameSessionError | GameSessionNotInLobbyError | TopicNotFoundError | ValidationError
  > {
    if (!this.isUserInSession(userId))
      return Fail(new UserNotInGameSessionError('Could not rename topic'));

    if (this.state !== GameSessionState.lobby)
      return Fail(new GameSessionNotInLobbyError('Could not rename topic'));

    const topic = this.topics.find((topic) => topic.getId() === topicId);
    if (!topic) return Fail(new TopicNotFoundError('Could not rename topic'));

    const result = topic.setName(newName);
    if (!result.isOk) return Fail(result.error);

    return Ok(topic);
  }

  public addPlayer(newPlayer: Player): Result<void, PlayerAlreadyInGameSessionError> {
    const player = this.players.find((player) => player.getUserId() === newPlayer.getUserId());
    if (!player) {
      this.players = this.players.concat(newPlayer);

      return Ok(undefined);
    }

    if (player.getIsConnected())
      return Fail(new PlayerAlreadyInGameSessionError('Could not add player'));

    player.setConnected(true);

    return Ok(undefined);
  }

  public removePlayer(userId: string): Result<void, PlayerNotInSessionError> {
    const playerIndex = this.players.findIndex((player) => player.getUserId() === userId);
    if (playerIndex === -1) return Fail(new PlayerNotInSessionError('Could not remove player'));

    this.players = this.players.filter((player) => player.getUserId() !== userId);

    return Ok(undefined);
  }

  public disconnectPlayer(userId: string): Result<Player, PlayerNotInSessionError> {
    const player = this.players.find((player) => player.getUserId() === userId);
    if (!player) return Fail(new PlayerNotInSessionError('Could not disconnect player'));

    player.setConnected(false);

    return Ok(player);
  }

  public setState(newState: GameSessionState) {
    this.state = newState;
  }

  private isUserInSession(userId: string): boolean {
    return this.players.some((player) => player.getUserId() === userId);
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
