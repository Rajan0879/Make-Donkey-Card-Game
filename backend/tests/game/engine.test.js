import { describe, it, expect } from 'vitest';
import { GameEngine } from '../../src/modules/game/game.engine.js';
import { serializeGameStateForPlayer } from '../../src/modules/game/game.serializer.js';

describe('GameEngine & Timeout Integration Tests', () => {
  const mockPlayers = [
    { id: 'player-1', username: 'Alice', isHost: true },
    { id: 'player-2', username: 'Bob', isHost: false },
    { id: 'player-3', username: 'Charlie', isHost: false }
  ];

  it('initializes game, finds Ace of Spades holder, and starts first Chaal with them', () => {
    const engine = new GameEngine('ROOM101', mockPlayers);
    expect(engine.status).toBe('playing');
    expect(engine.isFirstChaalEver).toBe(true);

    const starterId = engine.currentStarterId;
    expect(['player-1', 'player-2', 'player-3']).toContain(starterId);

    // Starter hand MUST have Ace of Spades
    const starterHand = engine.hands[starterId];
    expect(starterHand.some(c => c.id === 'spades-A')).toBe(true);
  });

  it('protects private cards via serializeGameStateForPlayer', () => {
    const engine = new GameEngine('ROOM102', mockPlayers);
    const serializedForP1 = serializeGameStateForPlayer(engine, 'player-1');

    // Alice sees her own cards
    expect(serializedForP1.myHand).toEqual(engine.hands['player-1']);

    // Alice only sees card counts for opponents, not their cards!
    const bobSummary = serializedForP1.players.find(p => p.id === 'player-2');
    expect(bobSummary.cardCount).toBe(16);
    expect(bobSummary.hand).toBeUndefined();
  });

  it('handles non-starter turn timeout by returning played cards to original starter', () => {
    const engine = new GameEngine('ROOM103', mockPlayers);
    const starterId = engine.currentStarterId;

    // Starter plays Ace of Spades
    const playRes = engine.playCard(starterId, 'spades-A');
    expect(playRes.success).toBe(true);
    expect(engine.chaal.playedCards).toHaveLength(1);

    // It is now the next player's turn
    const secondPlayerId = engine.currentTurnId;
    expect(secondPlayerId).not.toBe(starterId);

    // Simulate turn timeout for second player
    const timeoutRes = engine.processTurnTimeout();
    expect(timeoutRes.type).toBe('non-starter-timeout');
    expect(timeoutRes.timedOutPlayerId).toBe(secondPlayerId);

    // Original starter takes back their played card
    expect(engine.hands[starterId].some(c => c.id === 'spades-A')).toBe(true);
    // Original starter starts again
    expect(engine.currentStarterId).toBe(starterId);
    expect(engine.currentTurnId).toBe(starterId);
  });

  it('handles starter turn timeout by advancing clockwise to next active player', () => {
    const engine = new GameEngine('ROOM104', mockPlayers);
    const initialStarterId = engine.currentStarterId;

    // Starter times out before playing any card
    const timeoutRes = engine.processTurnTimeout();
    expect(timeoutRes.type).toBe('starter-timeout');
    expect(timeoutRes.timedOutPlayerId).toBe(initialStarterId);

    // New starter is assigned
    expect(engine.currentStarterId).not.toBe(initialStarterId);
    expect(engine.currentTurnId).toBe(engine.currentStarterId);
    expect(engine.chaal.playedCards).toHaveLength(0);
  });

  it('removes player and their cards in between game without cancelling if 2+ players remain', () => {
    const engine = new GameEngine('ROOM105', mockPlayers);
    expect(engine.players).toHaveLength(3);

    // Remove player-2
    const res = engine.removePlayer('player-2');
    expect(res).not.toBeNull();
    expect(res.gameOver).toBe(false);
    expect(engine.status).toBe('playing');
    expect(engine.players).toHaveLength(2);
    expect(engine.hands['player-2']).toBeUndefined();
    expect(engine.playerOrder).not.toContain('player-2');
  });

  it('declares sole remaining player winner when all other players leave', () => {
    const engine = new GameEngine('ROOM106', mockPlayers);
    // Remove 2 players
    engine.removePlayer('player-2');
    const res2 = engine.removePlayer('player-3');

    expect(res2.gameOver).toBe(true);
    expect(engine.status).toBe('finished');
    expect(engine.winners).toContain('player-1');
  });
});
