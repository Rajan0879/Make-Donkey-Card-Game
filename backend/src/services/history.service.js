import { firestoreDb } from '../config/firebase.js';
import { logger } from '../utils/logger.js';

// In-memory fallback if Firestore is not connected
const inMemoryHistory = [];
const inMemoryStats = new Map();

export async function saveCompletedMatch({ roomId, players, donkeyId }) {
  const matchRecord = {
    gameId: `game_${Date.now()}_${roomId}`,
    roomId,
    players: players.map(p => ({
      uid: p.id,
      username: p.username,
      result: p.id === donkeyId ? 'donkey' : 'winner'
    })),
    donkeyId,
    completedAt: new Date().toISOString(),
    status: 'completed'
  };

  try {
    if (firestoreDb) {
      await firestoreDb.collection('gameHistory').doc(matchRecord.gameId).set(matchRecord);

      // Update statistics for all players in Firestore
      const batch = firestoreDb.batch();
      for (const p of players) {
        const userRef = firestoreDb.collection('users').doc(p.id);
        const isDonkey = p.id === donkeyId;
        batch.set(userRef, {
          username: p.username,
          totalGames: firestoreDb.FieldValue.increment(1),
          totalWins: firestoreDb.FieldValue.increment(isDonkey ? 0 : 1),
          donkeyCount: firestoreDb.FieldValue.increment(isDonkey ? 1 : 0),
          updatedAt: firestoreDb.FieldValue.serverTimestamp()
        }, { merge: true });
      }
      await batch.commit();
      logger.info({ gameId: matchRecord.gameId }, 'Match recorded to Firestore.');
    } else {
      inMemoryHistory.unshift(matchRecord);
      for (const p of players) {
        const current = inMemoryStats.get(p.id) || { totalGames: 0, totalWins: 0, donkeyCount: 0 };
        const isDonkey = p.id === donkeyId;
        inMemoryStats.set(p.id, {
          totalGames: current.totalGames + 1,
          totalWins: current.totalWins + (isDonkey ? 0 : 1),
          donkeyCount: current.donkeyCount + (isDonkey ? 1 : 0)
        });
      }
      logger.info({ gameId: matchRecord.gameId }, 'Match recorded to in-memory history store.');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to record match history');
  }

  return matchRecord;
}

export async function getPlayerStats(userId) {
  if (firestoreDb) {
    try {
      const doc = await firestoreDb.collection('users').doc(userId).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch (err) {
      logger.error({ err }, 'Failed reading user stats from Firestore');
    }
  }
  return inMemoryStats.get(userId) || { totalGames: 0, totalWins: 0, donkeyCount: 0 };
}
