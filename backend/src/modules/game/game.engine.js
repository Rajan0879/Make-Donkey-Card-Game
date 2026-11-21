import { GAME_STATUS, PLAYER_STATUS, ROOM_LIMITS, ACE_OF_SPADES_ID } from './game.constants.js';
import { distributeCards } from './game.distribution.js';
import { validateCardPlay, isOffSuit } from './game.rules.js';
import { createChaal, resolveChaal } from './game.chaal.js';
import { getNextActivePlayer, haveAllActivePlayersPlayed } from './game.turns.js';
import { handleTurnTimeout } from './game.timer.js';

export class GameEngine {
  constructor(roomId, playerList) {
    if (!playerList || playerList.length < ROOM_LIMITS.MIN_PLAYERS || playerList.length > ROOM_LIMITS.MAX_PLAYERS) {
      throw new Error(`Room requires between ${ROOM_LIMITS.MIN_PLAYERS} and ${ROOM_LIMITS.MAX_PLAYERS} players.`);
    }

    this.roomId = roomId;
    this.status = GAME_STATUS.PLAYING;
    this.playerOrder = playerList.map(p => p.id);
    this.players = playerList.map(p => ({
      id: p.id,
      username: p.username || 'Anonymous',
      avatar: p.avatar || null,
      status: PLAYER_STATUS.ACTIVE,
      connected: true,
      isHost: !!p.isHost
    }));

    this.winners = [];
    this.donkeyId = null;
    this.isFirstChaalEver = true;
    this.paused = false;
    this.pauseRemainingMs = null;
    this.disconnectGraceDeadline = null;

    // Distribute cards
    const { hands, unusedCards, aceHolderId } = distributeCards(this.playerOrder);
    this.hands = hands;
    this.unusedCards = unusedCards;

    // First Chaal setup: Ace of Spades holder starts
    this.currentStarterId = aceHolderId;
    this.currentTurnId = aceHolderId;
    this.chaal = createChaal(aceHolderId);
    this.turnDeadline = Date.now() + (ROOM_LIMITS.TURN_TIMEOUT_SECONDS * 1000);
  }

  /**
   * Attempts to play a card for a player.
   * Authoritative validation and state transition.
   */
  playCard(playerId, cardId) {
    if (this.status !== GAME_STATUS.PLAYING) {
      return { success: false, error: 'Game is not actively playing.' };
    }

    if (this.paused) {
      return { success: false, error: 'Game is currently paused.' };
    }

    if (this.currentTurnId !== playerId) {
      return { success: false, error: 'Not your turn to play.' };
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player || player.status !== PLAYER_STATUS.ACTIVE) {
      return { success: false, error: 'Player is not an active participant.' };
    }

    const hand = this.hands[playerId] || [];
    const isStarter = this.currentTurnId === this.chaal.starterId;

    // Validate move against rules
    const validation = validateCardPlay({
      playerId,
      cardId,
      hand,
      isFirstChaalEver: this.isFirstChaalEver,
      isStarter,
      startingSuit: this.chaal.startingSuit
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Move is valid - execute it!
    const cardIndex = hand.findIndex(c => c.id === cardId);
    const [playedCard] = hand.splice(cardIndex, 1);

    // If starter, establish starting suit
    if (isStarter) {
      this.chaal.startingSuit = playedCard.suit;
      this.isFirstChaalEver = false; // first Chaal starter has now played ♠A
    }

    const playRecord = {
      playerId,
      card: playedCard,
      playedAt: Date.now()
    };
    this.chaal.playedCards.push(playRecord);

    // Check if this card was off-suit
    const playedOffSuit = !isStarter && isOffSuit(playedCard, this.chaal.startingSuit);

    if (playedOffSuit) {
      // Scenario B: Off-suit played. Chaal terminates immediately!
      this.chaal.endedByOffSuit = true;
      this.chaal.offSuitPlayerId = playerId;

      const completedChaalSnapshot = {
        starterId: this.chaal.starterId,
        startingSuit: this.chaal.startingSuit,
        playedCards: [...this.chaal.playedCards],
        endedByOffSuit: true,
        offSuitPlayerId: playerId
      };

      const resolution = resolveChaal({
        chaal: this.chaal,
        hands: this.hands,
        players: this.players
      });

      this._handlePostResolution(resolution);

      return {
        success: true,
        playRecord,
        chaalEnded: true,
        resolution,
        completedChaalSnapshot
      };
    }

    // Scenario A or Chaal In-Progress:
    // Check if all active players have now played in this Chaal
    const chaalComplete = haveAllActivePlayersPlayed(this.players, this.chaal.playedCards);

    if (chaalComplete) {
      // All active players followed suit!
      const completedChaalSnapshot = {
        starterId: this.chaal.starterId,
        startingSuit: this.chaal.startingSuit,
        playedCards: [...this.chaal.playedCards],
        endedByOffSuit: false,
        offSuitPlayerId: null
      };

      const resolution = resolveChaal({
        chaal: this.chaal,
        hands: this.hands,
        players: this.players
      });

      this._handlePostResolution(resolution);

      return {
        success: true,
        playRecord,
        chaalEnded: true,
        resolution,
        completedChaalSnapshot
      };
    }

    // Chaal continues to next active player clockwise
    const nextPlayerId = getNextActivePlayer(this.playerOrder, this.players, playerId);
    this.currentTurnId = nextPlayerId;
    this.turnDeadline = Date.now() + (ROOM_LIMITS.TURN_TIMEOUT_SECONDS * 1000);

    return {
      success: true,
      playRecord,
      chaalEnded: false,
      nextTurnId: nextPlayerId
    };
  }

  _handlePostResolution(resolution) {
    if (resolution.newWinners && resolution.newWinners.length > 0) {
      this.winners.push(...resolution.newWinners);
    }

    if (resolution.isGameOver) {
      this.status = GAME_STATUS.FINISHED;
      this.donkeyId = resolution.donkeyId;
      this.currentTurnId = null;
      this.turnDeadline = null;
    } else {
      this.currentStarterId = resolution.nextStarterId;
      this.currentTurnId = resolution.nextStarterId;
      this.chaal = createChaal(resolution.nextStarterId);
      this.turnDeadline = Date.now() + (ROOM_LIMITS.TURN_TIMEOUT_SECONDS * 1000);
    }
  }

  /**
   * Triggered when turn timer expires on server.
   */
  processTurnTimeout() {
    return handleTurnTimeout(this);
  }

  /**
   * Pauses the game during an accidental disconnect.
   */
  pauseGame() {
    if (this.paused || this.status !== GAME_STATUS.PLAYING) return;
    this.paused = true;
    this.pauseRemainingMs = Math.max(0, this.turnDeadline - Date.now());
    this.disconnectGraceDeadline = Date.now() + (ROOM_LIMITS.RECONNECT_GRACE_SECONDS * 1000);
  }

  /**
   * Resumes the game when disconnected player returns.
   */
  resumeGame() {
    if (!this.paused || this.status !== GAME_STATUS.PLAYING) return;
    this.paused = false;
    this.turnDeadline = Date.now() + (this.pauseRemainingMs || ROOM_LIMITS.TURN_TIMEOUT_SECONDS * 1000);
    this.pauseRemainingMs = null;
    this.disconnectGraceDeadline = null;
  }

  /**
   * Cancels the active game due to grace expiration or intentional leave.
   */
  cancelGame() {
    this.status = GAME_STATUS.CANCELLED;
    this.currentTurnId = null;
    this.turnDeadline = null;
    this.paused = false;
  }
}
