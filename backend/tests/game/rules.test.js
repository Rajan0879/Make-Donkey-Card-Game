import { describe, it, expect } from 'vitest';
import { validateCardPlay, isOffSuit } from '../../src/modules/game/game.rules.js';
import { ACE_OF_SPADES_ID } from '../../src/modules/game/game.constants.js';

describe('Card Play Validation Rules', () => {
  const p1Hand = [
    { id: 'spades-A', suit: 'spades', rank: 'A', value: 14 },
    { id: 'hearts-K', suit: 'hearts', rank: 'K', value: 13 },
    { id: 'diamonds-8', suit: 'diamonds', rank: '8', value: 8 }
  ];

  it('enforces that the first Chaal ever must start with the Ace of Spades', () => {
    // Attempting to start first Chaal with King of Hearts should fail
    const invalidPlay = validateCardPlay({
      playerId: 'p1',
      cardId: 'hearts-K',
      hand: p1Hand,
      isFirstChaalEver: true,
      isStarter: true,
      startingSuit: null
    });
    expect(invalidPlay.valid).toBe(false);
    expect(invalidPlay.error).toContain('Ace of Spades');

    // Playing Ace of Spades should succeed
    const validPlay = validateCardPlay({
      playerId: 'p1',
      cardId: 'spades-A',
      hand: p1Hand,
      isFirstChaalEver: true,
      isStarter: true,
      startingSuit: null
    });
    expect(validPlay.valid).toBe(true);
  });

  it('allows starter in subsequent Chaals to play any card in their hand', () => {
    const play = validateCardPlay({
      playerId: 'p1',
      cardId: 'diamonds-8',
      hand: p1Hand,
      isFirstChaalEver: false,
      isStarter: true,
      startingSuit: null
    });
    expect(play.valid).toBe(true);
  });

  it('enforces following the starting suit when the player holds that suit', () => {
    // Starting suit is hearts; p1 has hearts-K. Playing diamonds-8 is illegal!
    const illegalOffSuit = validateCardPlay({
      playerId: 'p1',
      cardId: 'diamonds-8',
      hand: p1Hand,
      isFirstChaalEver: false,
      isStarter: false,
      startingSuit: 'hearts'
    });
    expect(illegalOffSuit.valid).toBe(false);
    expect(illegalOffSuit.error).toContain('must follow the starting suit');

    // Playing hearts-K is valid
    const validFollow = validateCardPlay({
      playerId: 'p1',
      cardId: 'hearts-K',
      hand: p1Hand,
      isFirstChaalEver: false,
      isStarter: false,
      startingSuit: 'hearts'
    });
    expect(validFollow.valid).toBe(true);
  });

  it('allows playing an off-suit card only if the player holds NO cards of starting suit', () => {
    const noClubsHand = [
      { id: 'hearts-K', suit: 'hearts', rank: 'K', value: 13 },
      { id: 'diamonds-8', suit: 'diamonds', rank: '8', value: 8 }
    ];

    // Starting suit is clubs; player has no clubs. Playing diamonds-8 is valid!
    const validOffSuit = validateCardPlay({
      playerId: 'p2',
      cardId: 'diamonds-8',
      hand: noClubsHand,
      isFirstChaalEver: false,
      isStarter: false,
      startingSuit: 'clubs'
    });
    expect(validOffSuit.valid).toBe(true);
  });
});
