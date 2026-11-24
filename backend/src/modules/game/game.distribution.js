import { CARDS_PER_PLAYER, ACE_OF_SPADES_ID } from './game.constants.js';
import { createDeck, shuffleDeck } from './game.deck.js';

/**
 * Distributes cards to players according to player count rules.
 * For 5 players: 3 cards are omitted from the lowest rank (the three non-Spade 3s: ♥3, ♦3, ♣3),
 * keeping Spades intact and ensuring Ace of Spades is NEVER excluded.
 * 
 * @param {Array<string>} playerIds Array of player IDs in seat order
 * @param {Array} [customDeck] Optional custom deck for testing
 * @returns {{ hands: Record<string, Array>, unusedCards: Array, aceHolderId: string }}
 */
export function distributeCards(playerIds, customDeck = null) {
  const playerCount = playerIds.length;
  if (playerCount < 3 || playerCount > 6) {
    throw new Error(`Invalid player count: ${playerCount}. Must be between 3 and 6.`);
  }

  let deck = customDeck ? [...customDeck] : shuffleDeck(createDeck());
  const unusedCards = [];

  if (playerCount === 5) {
    // 3 cards must be left out from lowest available rank (non-Spade 3s: hearts-3, diamonds-3, clubs-3)
    const omittedCardIds = new Set(['hearts-3', 'diamonds-3', 'clubs-3']);
    const cardsToOmit = [];
    const remainingCards = [];

    for (const card of deck) {
      if (omittedCardIds.has(card.id)) {
        cardsToOmit.push(card);
      } else {
        remainingCards.push(card);
      }
    }

    unusedCards.push(...cardsToOmit);
    deck = shuffleDeck(remainingCards);
  }

  const hands = {};
  for (const id of playerIds) {
    hands[id] = [];
  }

  const cardsEach = CARDS_PER_PLAYER[playerCount].dealt;
  let cardIdx = 0;
  for (let round = 0; round < cardsEach; round++) {
    for (const id of playerIds) {
      hands[id].push(deck[cardIdx++]);
    }
  }

  // Find who holds the Ace of Spades
  let aceHolderId = null;
  for (const id of playerIds) {
    if (hands[id].some(c => c.id === ACE_OF_SPADES_ID)) {
      aceHolderId = id;
      break;
    }
  }

  if (!aceHolderId) {
    throw new Error('Ace of Spades is missing from dealt hands!');
  }

  return {
    hands,
    unusedCards,
    aceHolderId
  };
}
