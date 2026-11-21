import { PLAYER_STATUS } from './game.constants.js';

/**
 * Finds the next active player clockwise from the given playerId.
 * 
 * @param {Array<string>} playerOrder List of all player IDs in seating order
 * @param {Array<Object>} players List of player objects with current status
 * @param {string} currentTurnId Current player ID
 * @returns {string|null} ID of next active player, or null if none
 */
export function getNextActivePlayer(playerOrder, players, currentTurnId) {
  const activeIds = new Set(
    players.filter(p => p.status === PLAYER_STATUS.ACTIVE).map(p => p.id)
  );

  if (activeIds.size === 0) return null;

  const currentIndex = playerOrder.indexOf(currentTurnId);
  const total = playerOrder.length;

  for (let offset = 1; offset < total; offset++) {
    const nextIdx = (currentIndex + offset) % total;
    const candidateId = playerOrder[nextIdx];
    if (activeIds.has(candidateId)) {
      return candidateId;
    }
  }

  // If only the current player is active
  if (activeIds.has(currentTurnId)) {
    return currentTurnId;
  }

  return null;
}

/**
 * Checks whether all active players have played in the current Chaal.
 * 
 * @param {Array<Object>} players 
 * @param {Array<Object>} playedCards 
 * @returns {boolean}
 */
export function haveAllActivePlayersPlayed(players, playedCards) {
  const activePlayers = players.filter(p => p.status === PLAYER_STATUS.ACTIVE);
  const playedPlayerIds = new Set(playedCards.map(p => p.playerId));
  return activePlayers.every(p => playedPlayerIds.has(p.id));
}
