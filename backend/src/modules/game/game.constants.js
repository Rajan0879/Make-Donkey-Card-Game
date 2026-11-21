export const SUITS = Object.freeze({
  SPADES: 'spades',
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs'
});

export const SUIT_SYMBOLS = Object.freeze({
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
});

export const RANKS = Object.freeze({
  ACE: 'A',
  KING: 'K',
  QUEEN: 'Q',
  JACK: 'J',
  TEN: '10',
  NINE: '9',
  EIGHT: '8',
  SEVEN: '7',
  SIX: '6',
  FIVE: '5',
  FOUR: '4',
  THREE: '3'
});

export const CARD_VALUES = Object.freeze({
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3
});

export const ACE_OF_SPADES_ID = 'spades-A';

export const ROOM_LIMITS = Object.freeze({
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 6,
  TURN_TIMEOUT_SECONDS: 90,
  WARNING_SECONDS: 15,
  RECONNECT_GRACE_SECONDS: 90
});

export const CARDS_PER_PLAYER = Object.freeze({
  3: { dealt: 16, unused: 0 },
  4: { dealt: 12, unused: 0 },
  5: { dealt: 9, unused: 3 },
  6: { dealt: 8, unused: 0 }
});

export const GAME_STATUS = Object.freeze({
  WAITING: 'waiting',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
  CANCELLED: 'cancelled'
});

export const PLAYER_STATUS = Object.freeze({
  ACTIVE: 'active',
  WINNER: 'winner',
  DONKEY: 'donkey'
});
