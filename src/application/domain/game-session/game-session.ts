import { Id } from '@shared/id';
import { fail, ok, type Result } from '@shared/result';
import { ValidationError } from '../errors/validation-error';
import type { GameTopic } from '../game-topic';
import type { Player } from '../player';
import {
  GameSessionNotInLobbyError,
  PlayerAlreadyInGameSessionError,
  PlayerNotInSessionError,
  TopicAlreadyInGameSessionError,
  TopicNameAlreadyInSessionError,
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
    private _id: string,
    private _name: string,
    private _topics: GameTopic[],
    private _players: Player[],
    private _state: GameSessionState
  ) {}

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get topics(): GameTopic[] {
    return this._topics;
  }

  public get players(): Player[] {
    return this._players;
  }

  public get state(): GameSessionState {
    return this._state;
  }

  public rename(
    newName: string,
    userId: string
  ): Result<GameSession, ValidationError | UserNotInGameSessionError> {
    if (!this.isUserInSession(userId))
      return fail(new UserNotInGameSessionError('Could not rename game session'));

    const nameResult = GameSession.validateName(newName);
    if (!nameResult.isOk) return fail(nameResult.error);

    this._name = newName;

    return ok(this);
  }

  public addTopic(
    newTopic: GameTopic,
    userId: string
  ): Result<
    void,
    UserNotInGameSessionError | GameSessionNotInLobbyError | TopicAlreadyInGameSessionError
  > {
    if (!this.isUserInSession(userId))
      return fail(new UserNotInGameSessionError('Could not add topic'));

    if (this.state !== GameSessionState.lobby)
      return fail(new GameSessionNotInLobbyError('Could not add topic'));

    if (this._topics.find((topic) => newTopic.name.trim() === topic.name.trim()))
      return fail(new TopicAlreadyInGameSessionError('Could not add topic'));

    this._topics = this._topics.concat(newTopic);

    return ok(undefined);
  }

  public removeTopic(
    topicName: string,
    userId: string
  ): Result<
    GameTopic,
    UserNotInGameSessionError | GameSessionNotInLobbyError | TopicNotFoundError
  > {
    if (!this.isUserInSession(userId))
      return fail(new UserNotInGameSessionError('Could not remove topic'));

    if (this.state !== GameSessionState.lobby)
      return fail(new GameSessionNotInLobbyError('Could not remove topic'));

    const topicIndex = this._topics.findIndex((topic) => topic.name === topicName);
    if (topicIndex === -1) return fail(new TopicNotFoundError('Could not remove topic'));

    const topic = this._topics[topicIndex];
    this._topics = this._topics.filter((topic) => topic.name !== topicName);
    return ok(topic);
  }

  public renameTopic(
    topicId: string,
    newName: string,
    userId: string
  ): Result<
    GameTopic,
    | UserNotInGameSessionError
    | GameSessionNotInLobbyError
    | TopicNotFoundError
    | TopicNameAlreadyInSessionError
    | ValidationError
  > {
    if (!this.isUserInSession(userId))
      return fail(new UserNotInGameSessionError('Could not rename topic'));

    if (this._state !== GameSessionState.lobby)
      return fail(new GameSessionNotInLobbyError('Could not rename topic'));

    const topic = this._topics.find((topic) => topic.id === topicId);
    if (!topic) return fail(new TopicNotFoundError('Could not rename topic'));

    const topicWithSameName = this._topics.find(
      (topic) => topic.name.trim().toLowerCase() === newName.trim().toLowerCase()
    );
    if (topicWithSameName)
      return fail(new TopicNameAlreadyInSessionError('Could not rename topic'));

    const result = topic.setName(newName);
    if (!result.isOk) return fail(result.error);

    return ok(topic);
  }

  public addPlayer(newPlayer: Player): Result<void, PlayerAlreadyInGameSessionError> {
    const player = this._players.find((player) => player.userId === newPlayer.userId);
    if (!player) {
      this._players = this._players.concat(newPlayer);

      return ok(undefined);
    }

    if (player.isConnected)
      return fail(new PlayerAlreadyInGameSessionError('Could not add player'));

    player.setConnected(true);

    return ok(undefined);
  }

  public removePlayer(userId: string): Result<void, PlayerNotInSessionError> {
    const playerIndex = this._players.findIndex((player) => player.userId === userId);
    if (playerIndex === -1) return fail(new PlayerNotInSessionError('Could not remove player'));

    this._players = this._players.filter((player) => player.userId !== userId);

    return ok(undefined);
  }

  public disconnectPlayer(userId: string): Result<Player, PlayerNotInSessionError> {
    const player = this._players.find((player) => player.userId === userId);
    if (!player) return fail(new PlayerNotInSessionError('Could not disconnect player'));

    player.setConnected(false);

    return ok(player);
  }

  public setState(newState: GameSessionState) {
    this._state = newState;
  }

  private isUserInSession(userId: string): boolean {
    return this._players.some((player) => player.userId === userId);
  }

  public static create({
    id = Id.createSlug(),
    name,
    topics = [],
    players = [],
    state = GameSessionState.lobby,
  }: Props): Result<GameSession, ValidationError> {
    const nameResult = GameSession.validateName(name);
    if (!nameResult.isOk) return fail(nameResult.error);

    return ok(new GameSession(id, name, topics, players, state));
  }

  private static validateName(name: string): Result<string, ValidationError> {
    if (!name) return fail(new ValidationError('name', 'Name is required and cannot be empty.'));
    if (typeof name !== 'string')
      return fail(new ValidationError('name', 'Name must be a string.'));
    if (name.length < 2 || name.length > 30)
      return fail(new ValidationError('name', 'Name must be between 2 and 30 characters long.'));

    return ok(name);
  }
}
