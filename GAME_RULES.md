# GAME RULES: MAKE DONKEY

## 1. Objective
Avoid being the last remaining active player. The last active player with cards is declared the **DONKEY**.

## 2. Deck & Preparation
- Standard 52-card playing deck with **all four 2s removed** (Leaving 48 playable cards).
- Ranks (High to Low):
  `A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3` (Values 14 down to 3).
- Suits: Spades (♠), Hearts (♥), Diamonds (♦), Clubs (♣).
- Ace of Spades (`spades-ace`, value 14) is **always** in play.

## 3. Card Distribution
Cards are dealt equally:
- **3 Players**: 16 cards each, 0 unused.
- **4 Players**: 12 cards each, 0 unused.
- **5 Players**: 9 cards each, 3 unused cards left out of the game (Ace of Spades must NEVER be among the unused cards).
- **6 Players**: 8 cards each, 0 unused.

## 4. First Chaal
1. The player holding the **Ace of Spades** is the first Chaal starter.
2. The very first card played must be the **Ace of Spades**.
3. The starting suit of the first Chaal is Spades.
4. For all subsequent Chaals, the starter may play any card from their hand.

## 5. Chaal & Turn Order
- Turns proceed clockwise.
- Active players take one turn during a Chaal.
- When the starter plays a card, its suit becomes the **starting suit**.
- All subsequent players **must follow suit** if they have at least one card of that suit.
- If a player does NOT have any card of the starting suit, they may play any off-suit card.

## 6. Chaal Resolution Scenarios

### Scenario A: All Players Follow Suit
1. All active players played a card matching the starting suit.
2. Compare values of all played cards; find the highest card of the starting suit.
3. **All played cards are permanently removed from the game.**
4. Check players' remaining hand counts: any player with 0 cards becomes a **Winner** and is removed from active play.
5. Next starter: The player who played the highest card of the starting suit, IF still active. If that player has won (0 cards), the next-highest active player from this Chaal starts the next Chaal.

### Scenario B: A Player Plays Off-Suit
1. When a player cannot follow suit and plays an off-suit card, the Chaal **ends immediately**.
2. Players clockwise after the off-suit player do NOT get a turn.
3. **The original Chaal starter takes ALL cards played so far in this Chaal** (including their own card, cards played by players who followed suit, and the off-suit card).
4. All these cards return to the original starter's hand.
5. Check hand counts: any non-starter who reached 0 cards becomes a **Winner**.
6. The original starter starts the next Chaal.

## 7. Turn Timers & Timeouts
- Each turn has a **60-second** server-enforced countdown.
- **Non-starter timeout**: Chaal terminates immediately as an off-suit termination. Original starter collects all cards played so far. Timed-out player contributes no physical card. Original starter starts next Chaal.
- **Starter timeout**: Original starter is skipped. The next active player clockwise becomes the starter and begins a new Chaal. Original starter contributes no physical card.

## 8. Disconnection & Reconnection
- **Lobby Disconnection**: Player seat preserved; marked disconnected; ready status reset.
- **Active Game Accidental Disconnection**: Game pauses, timer freezes, 60s reconnect grace period. If player returns within 60s, resume. If not, game is cancelled.
- **Intentional Leave (Active Game)**:
  - If regular player leaves: Game is cancelled; players returned to room/lobby.
  - If host leaves: Host privilege transfers randomly to a remaining connected player; game continues.

## 9. Game-Ending Condition
- When only **one active player** remains with cards, the game ends immediately.
- That player is declared the **DONKEY**.
- Completed game history and statistics are saved to Firestore.

## 10. Open / Pending Rules (Under Review)
- Consecutive starter timeouts: currently advances clockwise to next active player.
- Simultaneous winner scenario if all active players empty hands: handled sequentially by resolution order.
- Inactive room expiry policy: default 2 hours timeout.
