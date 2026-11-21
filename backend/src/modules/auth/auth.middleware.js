import { authAdmin } from '../../config/firebase.js';
import { logger } from '../../utils/logger.js';

/**
 * Socket.IO authentication middleware.
 * Verifies Firebase ID token if present.
 * If running locally or without Firebase credentials, falls back gracefully to
 * dev/guest authenticated identity provided in handshake auth.
 */
export async function socketAuthMiddleware(socket, next) {
  try {
    const { token, guestUser } = socket.handshake.auth || {};

    if (token && authAdmin) {
      try {
        const decodedToken = await authAdmin.verifyIdToken(token);
        socket.user = {
          id: decodedToken.uid,
          username: decodedToken.name || decodedToken.email?.split('@')[0] || 'Player',
          email: decodedToken.email,
          avatar: decodedToken.picture || null,
          socketId: socket.id
        };
        return next();
      } catch (err) {
        logger.warn({ err }, 'Firebase token verification failed. Falling back to guest.');
      }
    }

    // Dev/Guest mode fallback
    if (guestUser && guestUser.id) {
      socket.user = {
        id: guestUser.id,
        username: guestUser.username || `Player_${guestUser.id.slice(-4)}`,
        avatar: guestUser.avatar || null,
        socketId: socket.id
      };
      return next();
    }

    // Fallback generated ID if nothing supplied
    socket.user = {
      id: `guest_${socket.id.slice(0, 6)}`,
      username: `Guest_${socket.id.slice(0, 4)}`,
      avatar: null,
      socketId: socket.id
    };
    return next();
  } catch (err) {
    logger.error({ err }, 'Socket authentication middleware error');
    return next(new Error('Authentication failed'));
  }
}
