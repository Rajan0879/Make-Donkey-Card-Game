import { ACE_OF_SPADES_ID } from './game.constants.js';

/**
 * Validates whether a player's card move is legal according to Make Donkey rules.
 * 
 * @param {Object} params
 * @param {string} params.playerId ID of player attempting to play
 * @param {string} params.cardId ID of card attempting to be played
 * @param {Array} params.hand Player's current hand of card objects
 * @param {boolean} params.isFirstChaalEver Whether this is the very first Chaal of the game
 * @param {boolean} params.isStarter Whether this player is starting the current Chaal
 * @param {string|null} params.startingSuit Suit of the current Chaal (null if starter turn)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCardPlay({
  playerId,
  cardId,
  hand,
  isFirstChaalEver,
  isStarter,
  startingSuit
}) {
  if (!hand || !Array.isArray(hand)) {
    return { valid: false, error: 'Invalid hand data.' };
  }

  const card = hand.find(c => c.id === cardId);
  if (!card) {
    return { valid: false, error: 'Card not found in player hand.' };
  }

  // First Chaal ever rule: First play MUST be Ace of Spades
  if (isFirstChaalEver && isStarter) {
    if (card.id !== ACE_OF_SPADES_ID) {
      return { valid: false, error: 'The first card of the game must be the Ace of Spades (♠A).' };
    }
    return { valid: true };
  }

  // If this player is starting a new Chaal (not first Chaal), they can play any card
  if (isStarter) {
    return { valid: true };
  }

  // If not starter, a starting suit must exist
  if (!startingSuit) {
    return { valid: false, error: 'Starting suit has not been established.' };
  }

  // If player plays same suit, always valid
  if (card.suit === startingSuit) {
    return { valid: true };
  }

  // Player played an off-suit card. Valid ONLY IF they have NO cards of startingSuit in hand.
  const hasStartingSuit = hand.some(c => c.suit === startingSuit);
  if (hasStartingSuit) {
    return {
      valid: false,
      error: `You must follow the starting suit (${startingSuit}) as you hold cards of that suit.`
    };
  }

  // Player has no cards of starting suit, so off-suit play is allowed
  return { valid: true };
}

/**
 * Determines whether a played card is off-suit.
 * @param {Object} card 
 * @param {string} startingSuit 
 * @returns {boolean}
 */
export function isOffSuit(card, startingSuit) {
  if (!startingSuit) return false;
  return card.suit !== startingSuit;
}
