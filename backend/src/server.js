import http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { socketAuthMiddleware } from './modules/auth/auth.middleware.js';
import { setupSocketHandlers } from './sockets/socket.index.js';
import { getPlayerStats } from './services/history.service.js';

const app = express();
const server = http.createServer(app);

// Security & Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// API Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Make Donkey',
    timestamp: new Date().toISOString()
  });
});

// Profile / Statistics endpoint
app.get('/api/stats/:userId', async (req, res) => {
  try {
    const stats = await getPlayerStats(req.params.userId);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Socket.IO Setup with CORS and transports
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Socket authentication & event dispatch
io.use(socketAuthMiddleware);
setupSocketHandlers(io);

// Server startup
server.listen(config.port, () => {
  logger.info(`Make Donkey authoritative backend listening on port ${config.port}`);
});

export { app, server, io };
