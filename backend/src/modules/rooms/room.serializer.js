/**
 * Safely serializes a Room for Socket.IO transmission.
 * STRIPS OUT circular Node.js Timeout instances (turnTimer, disconnectTimers)
 * and gameEngine instances to permanently prevent RangeError: Maximum call stack size exceeded!
 * 
 * @param {Object} room 
 * @returns {Object|null}
 */
export function serializeRoom(room) {
  if (!room) return null;
  return {
    id: room.id,
    code: room.code || room.id,
    hostId: room.hostId,
    status: room.status,
    minPlayers: room.minPlayers,
    maxPlayers: room.maxPlayers,
    createdAt: room.createdAt,
    players: (room.players || []).map(p => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar || null,
      isHost: Boolean(p.isHost),
      ready: Boolean(p.ready),
      connected: p.connected !== false
    }))
  };
}
