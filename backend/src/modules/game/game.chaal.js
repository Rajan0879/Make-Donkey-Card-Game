import { isOffSuit } from './game.rules.js';
import { checkWinners, findNextStarterAllFollow, checkDonkey } from './game.winners.js';

/**
 * Creates a fresh Chaal state.
 * @param {string} starterId 
 * @returns {Object}
 */
export function createChaal(starterId) {
  return {
    starterId,
    startingSuit: null,
    playedCards: [],
    endedByOffSuit: false,
    offSuitPlayerId: null,
    timedOutPlayerId: null
  };
}

/**
 * Resolves a completed Chaal according to the core Make Donkey rules.
 * 
 * Scenario A (All Follow):
 *   - Cards permanently discarded.
 *   - Check hand counts for winners.
 *   - Highest-value card of starting suit by an active player becomes next starter.
 * 
 * Scenario B (Off-Suit or non-starter timeout):
 *   - Original Chaal starter takes ALL played cards back into their hand.
 *   - Check hand counts for winners (non-starters could have reached 0).
 *   - Original Chaal starter starts the next Chaal.
 * 
 * @param {Object} params
 * @param {Object} params.chaal Current Chaal state
 * @param {Record<string, Array>} params.hands Hands map { playerId: Card[] }
 * @param {Array<Object>} params.players Players list
 * @returns {Object} Resolution details
 */
export function resolveChaal({ chaal, hands, players }) {
  const { starterId, startingSuit, playedCards, endedByOffSuit } = chaal;

  let returnedCards = [];
  let removedCards = [];
  let nextStarterId = null;

  if (endedByOffSuit) {
    // SCENARIO B: Off-suit occurred (or non-starter timed out)
    // All cards played so far return to the ORIGINAL starter's hand!
    returnedCards = playedCards.map(p => p.card);
    hands[starterId] = [...(hands[starterId] || []), ...returnedCards];

    // Check winners post-resolution
    const newWinners = checkWinners(players, hands);

    // Original starter starts again
    nextStarterId = starterId;

    const donkeyCheck = checkDonkey(players);

    return {
      type: 'off-suit',
      starterId,
      returnedCards,
      removedCards: [],
      nextStarterId,
      newWinners,
      isGameOver: donkeyCheck.isGameOver,
      donkeyId: donkeyCheck.donkeyId
    };
  } else {
    // SCENARIO A: All players followed the starting suit
    // All played cards are permanently removed from the game
    removedCards = playedCards.map(p => p.card);

    // Check winners post-resolution
    const newWinners = checkWinners(players, hands);

    const donkeyCheck = checkDonkey(players);

    if (donkeyCheck.isGameOver) {
      return {
        type: 'all-follow',
        starterId,
        returnedCards: [],
        removedCards,
        nextStarterId: null,
        newWinners,
        isGameOver: true,
        donkeyId: donkeyCheck.donkeyId
      };
    }

    // Determine next starter: highest starting-suit card by an active player
    nextStarterId = findNextStarterAllFollow(playedCards, startingSuit, players);

    return {
      type: 'all-follow',
      starterId,
      returnedCards: [],
      removedCards,
      nextStarterId,
      newWinners,
      isGameOver: false,
      donkeyId: null
    };
  }
}
