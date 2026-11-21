import { SUITS, RANKS, CARD_VALUES } from './game.constants.js';

/**
 * Creates the standard 48-card Make Donkey deck.
 * All four 2s are omitted.
 * @returns {Array<{id: string, suit: string, rank: string, value: number}>}
 */
export function createDeck() {
  const deck = [];
  const suits = Object.values(SUITS);
  const ranks = Object.values(RANKS);

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value: CARD_VALUES[rank]
      });
    }
  }

  return deck;
}

/**
 * Shuffles an array of cards using Fisher-Yates shuffle algorithm.
 * Returns a new shuffled array without mutating the original.
 * @param {Array} cards 
 * @returns {Array}
 */
export function shuffleDeck(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
