import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientIO } from 'socket.io-client';
import http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from '../../src/sockets/socket.index.js';
import { socketAuthMiddleware } from '../../src/modules/auth/auth.middleware.js';

describe('Real-Time Socket.IO Multiplayer Integration', () => {
  let server;
  let io;
  let port;

  beforeAll(async () => {
    const app = express();
    server = http.createServer(app);
    io = new SocketIOServer(server, { cors: { origin: '*' } });
    io.use(socketAuthMiddleware);
    setupSocketHandlers(io);

    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    io.close();
    await new Promise(resolve => server.close(resolve));
  });

  it('allows 3 players to create room, join, ready up, and start the game with Ace of Spades', async () => {
    const p1 = ClientIO(`http://localhost:${port}`, { auth: { guestUser: { id: 'p1', username: 'P1' } } });
    const p2 = ClientIO(`http://localhost:${port}`, { auth: { guestUser: { id: 'p2', username: 'P2' } } });
    const p3 = ClientIO(`http://localhost:${port}`, { auth: { guestUser: { id: 'p3', username: 'P3' } } });

    // 1. Host creates room
    const room = await new Promise((resolve) => {
      p1.emit('create_room', {}, (res) => resolve(res.room));
    });

    expect(room.code).toBeDefined();
    expect(room.players).toHaveLength(1);

    // 2. Players 2 and 3 join
    await new Promise((resolve) => p2.emit('join_room', { roomCode: room.code }, resolve));
    await new Promise((resolve) => p3.emit('join_room', { roomCode: room.code }, resolve));

    // 3. Mark ready
    await new Promise((resolve) => p2.emit('player_ready', { roomCode: room.code, ready: true }, resolve));
    await new Promise((resolve) => p3.emit('player_ready', { roomCode: room.code, ready: true }, resolve));

    // 4. Host starts game
    const gameStartPromise = new Promise((resolve) => {
      p1.on('game_state_updated', (state) => {
        if (state.status === 'playing') resolve(state);
      });
    });

    await new Promise((resolve) => p1.emit('start_game', { roomCode: room.code }, resolve));
    const p1State = await gameStartPromise;

    expect(p1State.status).toBe('playing');
    expect(p1State.players).toHaveLength(3);
    // Hands distributed
    expect(p1State.myHand.length).toBeGreaterThan(0);

    // Close test sockets
    p1.disconnect();
    p2.disconnect();
    p3.disconnect();
  });
});
