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
 * Resolves a completed Chaal according to Make Donkey rules.
 * 
 * Scenario A (All Follow):
 *   - Cards permanently discarded.
 *   - Check hand counts for winners.
 *   - Highest-value card of starting suit by an active player becomes next starter.
 * 
 * Scenario B (Off-Suit or non-starter timeout):
 *   - The player who threw the HIGHEST card of the starting suit takes ALL played cards.
 *   - That player starts the next Chaal.
 *   - Check hand counts for winners (players who emptied hands become winners).
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
    // Find the player who played the highest card of the starting suit in this bout
    const matchingPlays = playedCards
      .filter(p => p.card.suit === startingSuit)
      .sort((a, b) => b.card.value - a.card.value);

    // The player who threw the highest card of the starting suit is penalized.
    // Fallback to starterId only if no matching card found.
    const penaltyPlayerId = matchingPlays.length > 0 ? matchingPlays[0].playerId : starterId;

    // All played cards return to the penalty player's hand!
    returnedCards = playedCards.map(p => p.card);
    hands[penaltyPlayerId] = [...(hands[penaltyPlayerId] || []), ...returnedCards];

    // Check winners post-resolution (non-penalty players may have emptied their hands)
    const newWinners = checkWinners(players, hands);

    // Penalty player starts the next Chaal
    nextStarterId = penaltyPlayerId;

    const donkeyCheck = checkDonkey(players);

    return {
      type: 'off-suit',
      starterId,
      penaltyPlayerId,
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
        penaltyPlayerId: null,
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
      penaltyPlayerId: null,
      returnedCards: [],
      removedCards,
      nextStarterId,
      newWinners,
      isGameOver: false,
      donkeyId: null
    };
  }
}
