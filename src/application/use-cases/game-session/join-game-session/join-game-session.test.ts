import {
  BroadcastToGameSessionError,
  DatabaseError,
  type GameSession,
  type GameSessionRepository,
  JoinGameSessionError,
  Player,
  PlayerAlreadyInGameSessionError,
  ValidationError,
} from '@app/domain';
import { PlayerJoinedEvent } from '@app/dtos';
import { GameSessionMapper, PlayerMapper } from '@app/mappers';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok } from '@shared/result';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { JoinGameSession } from './join-game-session';

vi.mock('@app/domain/player');
vi.mock('@app/mappers/player-mapper');
vi.mock('@app/mappers/game-session-mapper');
vi.mock('@app/dtos/events/player-joined-event');

describe('JoinGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameSessionService = mock<GameSessionService>();
  const PlayerFactory = vi.mocked(Player);
  const player = mock<Player>();
  const gameSession = mock<GameSession>();
  const playerMapper = vi.mocked(PlayerMapper);
  const gameSessionMapper = vi.mocked(GameSessionMapper);
  const playerJoinedEvent = vi.mocked(PlayerJoinedEvent);

  const useCase = new JoinGameSession(gameSessionRepository, gameSessionService);

  beforeEach(() => {
    gameSessionRepository.findById.mockResolvedValue(Ok(gameSession));
    PlayerFactory.create.mockReturnValue(Ok(player));
    gameSessionRepository.save.mockResolvedValue(Ok(undefined));
    gameSession.addPlayer.mockReturnValue(Ok(undefined));
    gameSession.getId.mockReturnValue('sessionId');
    player.getUserId.mockReturnValue('userId');
    gameSessionService.addPlayerToSession.mockReturnValue(Ok(undefined));
    gameSessionService.broadcastToSession.mockReturnValue(Ok(undefined));
    // @ts-expect-error
    playerMapper.toDTO.mockReturnValue('playerDTO');
    // @ts-expect-error
    gameSessionMapper.toDTO.mockReturnValue('gameSessionDTO');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns ValidationError if the player creation fails due to invalid input', async () => {
    PlayerFactory.create.mockReturnValue(Fail(new ValidationError('name', 'Error')));

    const result = await useCase.execute({
      sessionId: 'sessionId',
      playerName: 'a',
      userId: 'userId',
    });
    if (result.isOk) throw 'Expected an error';

    expect(PlayerFactory.create).toHaveBeenCalledWith({ name: 'a', userId: 'userId' });
    expect(result.error.code).toBe('ValidationError');
  });

  it('returns a DatabaseError if finding the game session fails', async () => {
    gameSessionRepository.findById.mockResolvedValue(Fail(new DatabaseError('Error')));

    const result = await useCase.execute({
      sessionId: 'sessionId',
      playerName: 'Some name',
      userId: 'userId',
    });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(result.error.code).toBe('DatabaseError');
  });

  it('returns a GameSessionNotFoundError error if the game session could not be found', async () => {
    gameSessionRepository.findById.mockResolvedValue(Ok(null));

    const result = await useCase.execute({
      sessionId: 'sessionId',
      playerName: 'Some name',
      userId: 'userId',
    });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(result.error.code).toBe('GameSessionNotFoundError');
  });

  it('returns a PlayerAlreadyInGameSessionError if the player is already in the game session', async () => {
    gameSession.addPlayer.mockReturnValue(Fail(new PlayerAlreadyInGameSessionError('Error')));

    const result = await useCase.execute({
      sessionId: 'sessionId',
      playerName: 'Some name',
      userId: 'userId',
    });
    if (result.isOk) throw 'Expected an error';

    expect(gameSession.addPlayer).toHaveBeenCalledWith(player);
    expect(result.error.code).toBe('PlayerAlreadyInGameSessionError');
  });

  it('returns a DatabaseError if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(Fail(new DatabaseError('Error')));

    const result = await useCase.execute({
      sessionId: 'sessionId',
      playerName: 'Some name',
      userId: 'userId',
    });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(result.error.code).toBe('DatabaseError');
  });

  it('returns a JoinGameSessionError if adding the player to the session fails', async () => {
    gameSessionService.addPlayerToSession.mockReturnValue(Fail(new JoinGameSessionError('Error')));

    const result = await useCase.execute({
      sessionId: 'sessionId',
      playerName: 'Some name',
      userId: 'userId',
    });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionService.addPlayerToSession).toHaveBeenCalledWith('sessionId', 'userId');
    expect(result.error.code).toBe('JoinGameSessionError');
  });

  it('returns a BroadcastToGameSessionError if broadcasting the player joined event fails', async () => {
    gameSessionService.broadcastToSession.mockReturnValue(
      Fail(new BroadcastToGameSessionError('Error'))
    );

    const result = await useCase.execute({
      sessionId: 'sessionId',
      playerName: 'Some name',
      userId: 'userId',
    });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionService.broadcastToSession).toHaveBeenCalledWith(
      'sessionId',
      expect.any(PlayerJoinedEvent)
    );
    expect(playerJoinedEvent).toHaveBeenCalledWith({
      player: 'playerDTO',
      gameSession: 'gameSessionDTO',
    });
    expect(result.error.code).toBe('BroadcastToGameSessionError');
  });

  it('returns the game session DTO on success', async () => {
    const result = await useCase.execute({
      sessionId: 'sessionId',
      playerName: 'Some name',
      userId: 'userId',
    });
    if (!result.isOk) throw 'Expected a successful result';

    expect(result.data).toBe('gameSessionDTO');
    expect(PlayerFactory.create).toHaveBeenCalledWith({ name: 'Some name', userId: 'userId' });
    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(gameSession.addPlayer).toHaveBeenCalledWith(player);
    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(gameSessionService.addPlayerToSession).toHaveBeenCalledWith('sessionId', 'userId');
    expect(gameSessionService.broadcastToSession).toHaveBeenCalledWith(
      'sessionId',
      expect.any(PlayerJoinedEvent)
    );
    expect(playerJoinedEvent).toHaveBeenCalledWith({
      player: 'playerDTO',
      gameSession: 'gameSessionDTO',
    });
  });
});
