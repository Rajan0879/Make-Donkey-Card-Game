import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck } from '../../src/modules/game/game.deck.js';
import { distributeCards } from '../../src/modules/game/game.distribution.js';
import { ACE_OF_SPADES_ID, SUITS, RANKS } from '../../src/modules/game/game.constants.js';

describe('Deck Creation & Distribution Tests', () => {
  it('creates exactly 48 playable cards with all four 2s removed', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(48);

    // Ensure no 2s exist
    const twos = deck.filter(c => c.rank === '2');
    expect(twos).toHaveLength(0);

    // Ensure Ace of Spades is present
    const aceOfSpades = deck.find(c => c.id === ACE_OF_SPADES_ID);
    expect(aceOfSpades).toBeDefined();
    expect(aceOfSpades.suit).toBe('spades');
    expect(aceOfSpades.rank).toBe('A');
    expect(aceOfSpades.value).toBe(14);

    // Ensure 12 cards per suit
    for (const suit of Object.values(SUITS)) {
      const cardsInSuit = deck.filter(c => c.suit === suit);
      expect(cardsInSuit).toHaveLength(12);
    }
  });

  it('contains unique card IDs with no duplicates', () => {
    const deck = createDeck();
    const ids = new Set(deck.map(c => c.id));
    expect(ids.size).toBe(48);
  });

  it('distributes cards correctly for 3 players (16 each, 0 unused)', () => {
    const players = ['p1', 'p2', 'p3'];
    const { hands, unusedCards, aceHolderId } = distributeCards(players);

    expect(hands.p1).toHaveLength(16);
    expect(hands.p2).toHaveLength(16);
    expect(hands.p3).toHaveLength(16);
    expect(unusedCards).toHaveLength(0);
    expect(players).toContain(aceHolderId);
  });

  it('distributes cards correctly for 4 players (12 each, 0 unused)', () => {
    const players = ['p1', 'p2', 'p3', 'p4'];
    const { hands, unusedCards, aceHolderId } = distributeCards(players);

    for (const p of players) {
      expect(hands[p]).toHaveLength(12);
    }
    expect(unusedCards).toHaveLength(0);
    expect(players).toContain(aceHolderId);
  });

  it('distributes cards correctly for 5 players (9 each, 3 unused lowest ranks: ♥3, ♦3, ♣3, ♠A never excluded)', () => {
    const players = ['p1', 'p2', 'p3', 'p4', 'p5'];
    
    // Run multiple times to verify consistency
    for (let i = 0; i < 20; i++) {
      const { hands, unusedCards, aceHolderId } = distributeCards(players);

      for (const p of players) {
        expect(hands[p]).toHaveLength(9);
      }
      expect(unusedCards).toHaveLength(3);
      
      const unusedIds = unusedCards.map(c => c.id).sort();
      expect(unusedIds).toEqual(['clubs-3', 'diamonds-3', 'hearts-3']);
      
      // Verify Ace of Spades is never omitted
      expect(unusedCards.some(c => c.id === ACE_OF_SPADES_ID)).toBe(false);
      expect(players).toContain(aceHolderId);

      // Verify all remaining cards are unique and total 45
      const allDealtCards = Object.values(hands).flat();
      expect(allDealtCards).toHaveLength(45);
      const dealtIds = new Set(allDealtCards.map(c => c.id));
      expect(dealtIds.size).toBe(45);

      // Verify none of the omitted 3s are in anyone's hand
      expect(dealtIds.has('clubs-3')).toBe(false);
      expect(dealtIds.has('diamonds-3')).toBe(false);
      expect(dealtIds.has('hearts-3')).toBe(false);
      // But ♠3 is still in play
      expect(dealtIds.has('spades-3')).toBe(true);
    }
  });

  it('distributes cards correctly for 6 players (8 each, 0 unused)', () => {
    const players = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
    const { hands, unusedCards, aceHolderId } = distributeCards(players);

    for (const p of players) {
      expect(hands[p]).toHaveLength(8);
    }
    expect(unusedCards).toHaveLength(0);
    expect(players).toContain(aceHolderId);
  });

  it('rejects invalid player counts (< 3 or > 6)', () => {
    expect(() => distributeCards(['p1', 'p2'])).toThrow();
    expect(() => distributeCards(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'])).toThrow();
  });
});
