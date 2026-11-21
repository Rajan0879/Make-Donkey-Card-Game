# MAKE DONKEY 🫏
### Real-Time Multiplayer Online Card Game

Make Donkey is a full-stack, responsive multiplayer card game built with **React, Node.js, Express, Socket.IO, and Firebase**.

---

## 🎮 Game Rules Summary
- **Deck**: Standard 52-card deck with **all four 2s removed** (48 cards total).
- **Ranks**: `A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3`.
- **First Chaal**: The player holding the **Ace of Spades (♠A)** starts the game and must lead with it.
- **Following Suit**: All players must follow the starting suit if they hold a card of that suit.
- **Scenario A (All Follow)**: If everyone follows suit, the cards are permanently discarded from the game. The player with the highest card of the starting suit (who is still active) starts the next Chaal.
- **Scenario B (Off-Suit)**: If a player does not have the suit and plays off-suit, the Chaal terminates **immediately**. The original Chaal starter takes **ALL** played cards back into their hand and leads the next Chaal.
- **Winning**: Any player who empties their hand after Chaal resolution becomes a **Winner**.
- **The Donkey**: The last remaining active player with cards is declared the **DONKEY**.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🧪 Running Automated Tests
Run comprehensive unit and multiplayer integration tests:
```bash
cd backend
npm test
```
All 20 test cases covering:
1. 48-card deck creation and 2s exclusion
2. Distribution rules for 3, 4, 5, and 6 players
3. Ace of Spades detection and leading requirement
4. Suit following and off-suit card validation
5. All-follow discard and off-suit card collection
6. Winner detection and next starter calculation
7. 60-second server authoritative turn timers and timeouts
8. Real-time multi-client Socket.IO synchronization and private hand serialization

---

## 🌐 Free-Tier Deployment Guide

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import `frontend` project on Vercel.
3. Set Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g. `https://make-donkey-backend.onrender.com`)
   - `VITE_SOCKET_URL`: Your backend URL
4. Build command: `npm run build`, Output directory: `dist`.

### Backend (Render)
1. Create a Web Service on Render pointing to the `backend` folder.
2. Build Command: `npm install`
3. Start Command: `node src/server.js`
4. Set Environment Variables:
   - `PORT`: `5000`
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `FIREBASE_PROJECT_ID`: (Optional) Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: (Optional) Firebase client email
   - `FIREBASE_PRIVATE_KEY`: (Optional) Firebase private key
