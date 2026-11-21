/**
 * Serializes the game state specifically for a recipient player.
 * NEVER leaks other players' private cards!
 * 
 * @param {import('./game.engine.js').GameEngine} engine 
 * @param {string} recipientPlayerId 
 * @returns {Object} Secure game state object
 */
export function serializeGameStateForPlayer(engine, recipientPlayerId) {
  // Extract recipient's private hand
  const myHand = engine.hands[recipientPlayerId] || [];

  // Public summary of all players
  const publicPlayers = engine.players.map(player => ({
    id: player.id,
    username: player.username,
    avatar: player.avatar,
    status: player.status,
    connected: player.connected,
    isHost: player.isHost,
    cardCount: (engine.hands[player.id] || []).length
  }));

  return {
    roomId: engine.roomId,
    status: engine.status,
    paused: engine.paused,
    disconnectGraceDeadline: engine.disconnectGraceDeadline,
    myHand,
    players: publicPlayers,
    playerOrder: engine.playerOrder,
    currentStarterId: engine.currentStarterId,
    currentTurnId: engine.currentTurnId,
    turnDeadline: engine.turnDeadline,
    chaal: {
      starterId: engine.chaal.starterId,
      startingSuit: engine.chaal.startingSuit,
      playedCards: engine.chaal.playedCards,
      endedByOffSuit: engine.chaal.endedByOffSuit
    },
    winners: engine.winners,
    donkeyId: engine.donkeyId,
    isFirstChaalEver: engine.isFirstChaalEver
  };
}
