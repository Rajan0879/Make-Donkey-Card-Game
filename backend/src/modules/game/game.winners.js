import { PLAYER_STATUS } from './game.constants.js';

/**
 * Checks players' hand counts post-resolution and updates statuses.
 * Any active player with 0 cards becomes a WINNER.
 * Returns newly declared winners.
 * 
 * @param {Array<Object>} players 
 * @param {Record<string, Array>} hands 
 * @returns {Array<string>} Array of player IDs who just won
 */
export function checkWinners(players, hands) {
  const newWinners = [];

  for (const player of players) {
    if (player.status === PLAYER_STATUS.ACTIVE) {
      const hand = hands[player.id] || [];
      if (hand.length === 0) {
        player.status = PLAYER_STATUS.WINNER;
        newWinners.push(player.id);
      }
    }
  }

  return newWinners;
}

/**
 * Finds the next starter when a Chaal resolves with all players following suit.
 * Evaluates played cards of the starting suit to find the highest value played by a player
 * who is STILL ACTIVE.
 * 
 * @param {Array<{playerId: string, card: Object}>} playedCards 
 * @param {string} startingSuit 
 * @param {Array<Object>} players Current list of player objects with updated status
 * @returns {string} ID of the next starter
 */
export function findNextStarterAllFollow(playedCards, startingSuit, players) {
  const activePlayerIds = new Set(
    players.filter(p => p.status === PLAYER_STATUS.ACTIVE).map(p => p.id)
  );

  // Filter played cards matching the starting suit and sort descending by card value
  const validPlays = playedCards
    .filter(p => p.card.suit === startingSuit)
    .sort((a, b) => b.card.value - a.card.value);

  // Pick the highest card played by someone who is STILL ACTIVE
  for (const play of validPlays) {
    if (activePlayerIds.has(play.playerId)) {
      return play.playerId;
    }
  }

  // Fallback: If all who played cards in this Chaal won, pick next active player in player list
  const nextActive = players.find(p => p.status === PLAYER_STATUS.ACTIVE);
  return nextActive ? nextActive.id : null;
}

/**
 * Checks whether only 1 active player remains.
 * If so, that player is declared DONKEY.
 * 
 * @param {Array<Object>} players 
 * @returns {{ isGameOver: boolean, donkeyId: string|null }}
 */
export function checkDonkey(players) {
  const activePlayers = players.filter(p => p.status === PLAYER_STATUS.ACTIVE);

  if (activePlayers.length === 1) {
    const donkey = activePlayers[0];
    donkey.status = PLAYER_STATUS.DONKEY;
    return {
      isGameOver: true,
      donkeyId: donkey.id
    };
  }

  return {
    isGameOver: false,
    donkeyId: null
  };
}
