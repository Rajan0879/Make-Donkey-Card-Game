import { ROOM_LIMITS } from './game.constants.js';
import { getNextActivePlayer } from './game.turns.js';
import { resolveChaal } from './game.chaal.js';

/**
 * Handles a turn timeout according to Section 8 of the specification:
 * 
 * 8.1 Non-starter timeout:
 *   - The Chaal ends immediately.
 *   - Treat timeout as an off-suit termination.
 *   - Original starter takes all cards played so far.
 *   - Timed-out player contributes NO card.
 *   - Later players do not get a turn.
 *   - Original starter starts the next Chaal.
 * 
 * 8.2 Starter timeout:
 *   - Skip the starter.
 *   - Find the next active player clockwise.
 *   - That player becomes the new starter.
 *   - Begin a new Chaal with that player.
 *   - Original starter contributes no card.
 * 
 * @param {Object} game Complete active game state
 * @returns {Object} Result of timeout processing
 */
export function handleTurnTimeout(game) {
  const currentTurnId = game.currentTurnId;
  const isStarter = currentTurnId === game.chaal.starterId;

  if (isStarter) {
    // 8.2 Starter timeout
    const nextStarter = getNextActivePlayer(game.playerOrder, game.players, currentTurnId);
    
    // Clear Chaal and assign new starter
    game.currentStarterId = nextStarter;
    game.currentTurnId = nextStarter;
    game.chaal = {
      starterId: nextStarter,
      startingSuit: null,
      playedCards: [],
      endedByOffSuit: false,
      offSuitPlayerId: null,
      timedOutPlayerId: currentTurnId
    };

    game.turnDeadline = Date.now() + (ROOM_LIMITS.TURN_TIMEOUT_SECONDS * 1000);

    return {
      type: 'starter-timeout',
      timedOutPlayerId: currentTurnId,
      newStarterId: nextStarter,
      resolution: null
    };
  } else {
    // 8.1 Non-starter timeout: Treat as off-suit termination
    game.chaal.endedByOffSuit = true;
    game.chaal.timedOutPlayerId = currentTurnId;

    const resolution = resolveChaal({
      chaal: game.chaal,
      hands: game.hands,
      players: game.players
    });

    if (resolution.isGameOver) {
      game.status = 'finished';
      game.donkeyId = resolution.donkeyId;
      game.currentTurnId = null;
      game.turnDeadline = null;
    } else {
      game.currentStarterId = resolution.nextStarterId;
      game.currentTurnId = resolution.nextStarterId;
      game.chaal = {
        starterId: resolution.nextStarterId,
        startingSuit: null,
        playedCards: [],
        endedByOffSuit: false,
        offSuitPlayerId: null,
        timedOutPlayerId: null
      };
      game.turnDeadline = Date.now() + (ROOM_LIMITS.TURN_TIMEOUT_SECONDS * 1000);
    }

    return {
      type: 'non-starter-timeout',
      timedOutPlayerId: currentTurnId,
      newStarterId: resolution.nextStarterId,
      resolution
    };
  }
}
