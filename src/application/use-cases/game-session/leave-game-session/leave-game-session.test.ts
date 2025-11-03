import {
  BroadcastToGameSessionError,
  DatabaseError,
  type GameSession,
  type GameSessionRepository,
  LeaveGameSessionError,
  type Player,
  PlayerNotInSessionError,
} from '@app/domain';
import { PlayerLeftEvent } from '@app/dtos/events/player-left-event';
import { GameSessionMapper, PlayerMapper } from '@app/mappers';
import type { GameSessionService } from '@app/ports/services';
import { Fail, Ok } from '@shared/result';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { LeaveGameSession } from './leave-game-session';

vi.mock('@app/mappers/player-mapper');
vi.mock('@app/mappers/game-session-mapper');
vi.mock('@app/dtos/events/player-left-event');

describe('LeaveGameSession', () => {
  const gameSessionRepository = mock<GameSessionRepository>();
  const gameSessionService = mock<GameSessionService>();
  const gameSession = mock<GameSession>();
  const player = mock<Player>();
  const playerLeftEvent = vi.mocked(PlayerLeftEvent);
  const playerMapper = vi.mocked(PlayerMapper);
  const gameSessionMapper = vi.mocked(GameSessionMapper);

  const useCase = new LeaveGameSession(gameSessionRepository, gameSessionService);

  beforeEach(() => {
    gameSessionRepository.findById.mockResolvedValue(Ok(gameSession));
    gameSession.disconnectPlayer.mockReturnValue(Ok(player));
    gameSessionRepository.save.mockResolvedValue(Ok(undefined));
    gameSessionService.removePlayerFromSession.mockReturnValue(Ok(undefined));
    gameSession.getId.mockReturnValue('sessionId');
    gameSessionService.broadcastToSession.mockReturnValue(Ok(undefined));
    // @ts-expect-error
    playerMapper.toDTO.mockReturnValue('playerDTO');
    // @ts-expect-error
    gameSessionMapper.toDTO.mockReturnValue('gameSessionDTO');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns a DatabaseError if finding the game session fails', async () => {
    gameSessionRepository.findById.mockResolvedValue(Fail(new DatabaseError('Error')));

    const result = await useCase.execute({ sessionId: 'sessionId', userId: 'userId' });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(result.error.code).toEqual('DatabaseError');
  });

  it('returns a GameSessionNotFoundError if the game session could not be found', async () => {
    gameSessionRepository.findById.mockResolvedValue(Ok(null));

    const result = await useCase.execute({ sessionId: 'sessionId', userId: 'userId' });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(result.error.code).toEqual('GameSessionNotFoundError');
  });

  it('returns a PlayerNotInSessionError if the player is not in the game session', async () => {
    gameSession.disconnectPlayer.mockReturnValue(Fail(new PlayerNotInSessionError('Error')));

    const result = await useCase.execute({ sessionId: 'sessionId', userId: 'userId' });
    if (result.isOk) throw 'Expected an error';

    expect(gameSession.disconnectPlayer).toHaveBeenCalledWith('userId');
    expect(result.error.code).toBe('PlayerNotInSessionError');
  });

  it('returns a DatabaseError if saving the game session fails', async () => {
    gameSessionRepository.save.mockResolvedValue(Fail(new DatabaseError('Error')));

    const result = await useCase.execute({ sessionId: 'sessionId', userId: 'userId' });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(result.error.code).toBe('DatabaseError');
  });

  it('returns a LeaveGameSessionError if disconnecting the player fails', async () => {
    gameSessionService.removePlayerFromSession.mockReturnValue(
      Fail(new LeaveGameSessionError('Error'))
    );

    const result = await useCase.execute({ sessionId: 'sessionId', userId: 'userId' });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionService.removePlayerFromSession).toHaveBeenCalledWith('sessionId', 'userId');
    expect(result.error.code).toBe('LeaveGameSessionError');
  });

  it('returns a BroadcastToGameSessionError if broadcasting the game session fails', async () => {
    gameSessionService.broadcastToSession.mockReturnValue(
      Fail(new BroadcastToGameSessionError('Error'))
    );

    const result = await useCase.execute({ sessionId: 'sessionId', userId: 'userId' });
    if (result.isOk) throw 'Expected an error';

    expect(gameSessionService.broadcastToSession).toHaveBeenCalledWith(
      'sessionId',
      expect.any(PlayerLeftEvent)
    );
    expect(playerLeftEvent).toHaveBeenCalledWith({
      player: 'playerDTO',
      gameSession: 'gameSessionDTO',
    });
    expect(result.error.code).toBe('BroadcastToGameSessionError');
  });

  it('returns Ok if the player leaves the game session successfully', async () => {
    const result = await useCase.execute({ sessionId: 'sessionId', userId: 'userId' });
    if (!result.isOk) throw 'Expected success';

    expect(gameSessionRepository.findById).toHaveBeenCalledWith('sessionId');
    expect(gameSession.disconnectPlayer).toHaveBeenCalledWith('userId');
    expect(gameSessionRepository.save).toHaveBeenCalledWith(gameSession);
    expect(gameSessionService.removePlayerFromSession).toHaveBeenCalledWith('sessionId', 'userId');
    expect(gameSessionService.broadcastToSession).toHaveBeenCalledWith(
      'sessionId',
      expect.any(PlayerLeftEvent)
    );
    expect(playerLeftEvent).toHaveBeenCalledWith({
      player: 'playerDTO',
      gameSession: 'gameSessionDTO',
    });
  });
});
