import { CARDS_PER_PLAYER, ACE_OF_SPADES_ID } from './game.constants.js';
import { createDeck, shuffleDeck } from './game.deck.js';

/**
 * Distributes cards to players according to player count rules.
 * For 5 players: 3 cards are set aside, ensuring Ace of Spades is NEVER excluded.
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
    // 3 cards must be left out, but Ace of Spades must never be one of them
    const nonAceCards = deck.filter(c => c.id !== ACE_OF_SPADES_ID);
    const aceIndex = deck.findIndex(c => c.id === ACE_OF_SPADES_ID);
    const aceCard = deck[aceIndex];

    // Select 3 random non-Ace cards to remove
    const shuffledNonAce = shuffleDeck(nonAceCards);
    unusedCards.push(...shuffledNonAce.slice(0, 3));
    
    // Remaining 45 cards including Ace of Spades
    const remainingDeck = [aceCard, ...shuffledNonAce.slice(3)];
    deck = shuffleDeck(remainingDeck);
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
