import { describe, it, expect } from 'vitest';
import { resolveChaal } from '../../src/modules/game/game.chaal.js';
import { PLAYER_STATUS } from '../../src/modules/game/game.constants.js';

describe('Chaal Resolution & Donkey Rules', () => {
  it('Scenario A: Everyone follows suit - played cards permanently removed, highest card holder starts next', () => {
    const players = [
      { id: 'p1', status: PLAYER_STATUS.ACTIVE },
      { id: 'p2', status: PLAYER_STATUS.ACTIVE },
      { id: 'p3', status: PLAYER_STATUS.ACTIVE }
    ];

    const hands = {
      p1: [{ id: 'hearts-3', suit: 'hearts', rank: '3', value: 3 }],
      p2: [{ id: 'hearts-4', suit: 'hearts', rank: '4', value: 4 }],
      p3: [{ id: 'hearts-5', suit: 'hearts', rank: '5', value: 5 }]
    };

    const chaal = {
      starterId: 'p1',
      startingSuit: 'hearts',
      playedCards: [
        { playerId: 'p1', card: { id: 'hearts-8', suit: 'hearts', rank: '8', value: 8 } },
        { playerId: 'p2', card: { id: 'hearts-K', suit: 'hearts', rank: 'K', value: 13 } },
        { playerId: 'p3', card: { id: 'hearts-5', suit: 'hearts', rank: '5', value: 5 } }
      ],
      endedByOffSuit: false
    };

    const resolution = resolveChaal({ chaal, hands, players });

    expect(resolution.type).toBe('all-follow');
    expect(resolution.returnedCards).toHaveLength(0);
    expect(resolution.removedCards).toHaveLength(3);
    // Highest card was K (value 13) by p2
    expect(resolution.nextStarterId).toBe('p2');
    expect(resolution.isGameOver).toBe(false);
  });

  it('Scenario B: Off-suit played - player who threw HIGHEST card of starting suit takes ALL cards', () => {
    const players = [
      { id: 'p1', status: PLAYER_STATUS.ACTIVE },
      { id: 'p2', status: PLAYER_STATUS.ACTIVE },
      { id: 'p3', status: PLAYER_STATUS.ACTIVE }
    ];

    const hands = {
      p1: [{ id: 'spades-3', suit: 'spades', rank: '3', value: 3 }],
      p2: [{ id: 'spades-4', suit: 'spades', rank: '4', value: 4 }],
      p3: [] // p3 just played their last card which was off-suit
    };

    // p1 started with 8 of hearts
    // p2 followed with King of hearts (highest starting suit!)
    // p3 had no hearts and played 5 of spades (off-suit)
    const chaal = {
      starterId: 'p1',
      startingSuit: 'hearts',
      playedCards: [
        { playerId: 'p1', card: { id: 'hearts-8', suit: 'hearts', rank: '8', value: 8 } },
        { playerId: 'p2', card: { id: 'hearts-K', suit: 'hearts', rank: 'K', value: 13 } },
        { playerId: 'p3', card: { id: 'spades-5', suit: 'spades', rank: '5', value: 5 } } // Off-suit!
      ],
      endedByOffSuit: true,
      offSuitPlayerId: 'p3'
    };

    const resolution = resolveChaal({ chaal, hands, players });

    expect(resolution.type).toBe('off-suit');
    // p2 threw highest card of starting suit (King of hearts), so p2 takes all 3 cards!
    expect(resolution.penaltyPlayerId).toBe('p2');
    expect(resolution.returnedCards).toHaveLength(3);
    expect(hands.p2).toHaveLength(4); // 1 previous + 3 returned
    // p2 starts the next bout
    expect(resolution.nextStarterId).toBe('p2');
    // p3 emptied hand and becomes winner!
    expect(resolution.newWinners).toContain('p3');
    expect(players.find(p => p.id === 'p3').status).toBe(PLAYER_STATUS.WINNER);
  });

  it('Scenario A with Winner: if highest card holder empties hand, next highest active player starts', () => {
    const players = [
      { id: 'p1', status: PLAYER_STATUS.ACTIVE },
      { id: 'p2', status: PLAYER_STATUS.ACTIVE },
      { id: 'p3', status: PLAYER_STATUS.ACTIVE }
    ];

    const hands = {
      p1: [{ id: 'clubs-3', suit: 'clubs', rank: '3', value: 3 }],
      p2: [], // p2 played their last card and has 0 cards left
      p3: [{ id: 'clubs-5', suit: 'clubs', rank: '5', value: 5 }]
    };

    const chaal = {
      starterId: 'p1',
      startingSuit: 'clubs',
      playedCards: [
        { playerId: 'p1', card: { id: 'clubs-8', suit: 'clubs', rank: '8', value: 8 } },
        { playerId: 'p2', card: { id: 'clubs-K', suit: 'clubs', rank: 'K', value: 13 } },
        { playerId: 'p3', card: { id: 'clubs-5', suit: 'clubs', rank: '5', value: 5 } }
      ],
      endedByOffSuit: false
    };

    const resolution = resolveChaal({ chaal, hands, players });

    expect(resolution.type).toBe('all-follow');
    expect(resolution.newWinners).toContain('p2');
    // p2 won, so next highest active player was p1 (8 of clubs)
    expect(resolution.nextStarterId).toBe('p1');
  });

  it('Game ends when only 1 active player remains (Donkey declared)', () => {
    const players = [
      { id: 'p1', status: PLAYER_STATUS.ACTIVE },
      { id: 'p2', status: PLAYER_STATUS.WINNER },
      { id: 'p3', status: PLAYER_STATUS.WINNER }
    ];

    const hands = {
      p1: [{ id: 'spades-2', suit: 'spades', rank: '2', value: 2 }],
      p2: [],
      p3: []
    };

    const chaal = {
      starterId: 'p1',
      startingSuit: 'hearts',
      playedCards: [
        { playerId: 'p1', card: { id: 'hearts-3', suit: 'hearts', rank: '3', value: 3 } }
      ],
      endedByOffSuit: false
    };

    const resolution = resolveChaal({ chaal, hands, players });
    expect(resolution.isGameOver).toBe(true);
    expect(resolution.donkeyId).toBe('p1');
  });
});
