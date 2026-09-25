import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Setup Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Attach io instance to express app so routes/controllers can access it via req.app.get('io')
app.set('io', io);

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.io Real-time Event Management
io.on('connection', (socket) => {
  console.log(`\x1b[36m[Socket.io]\x1b[0m Client connected: ${socket.id}`);

  // Officer / Bidder joins specific tender room for live verification updates
  socket.on('join_tender', (tenderId) => {
    if (tenderId) {
      socket.join(`tender_${tenderId}`);
      console.log(`\x1b[36m[Socket.io]\x1b[0m Socket ${socket.id} joined tender_${tenderId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`\x1b[36m[Socket.io]\x1b[0m Client disconnected: ${socket.id}`);
  });
});

// Root API Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'PRAMAN API Engine',
    version: '1.0.0',
    description: 'Autonomous AI-Powered Public Procurement Bid Verification Engine',
    status: 'Active',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tenders: '/api/tenders',
      bids: '/api/bids',
      verification: '/api/verify',
      audit: '/api/audit',
    },
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    status: 'ok',
    service: 'PRAMAN Verification Engine Backend',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
      code: dbState,
    },
    uptime: `${process.uptime().toFixed(1)}s`,
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`\x1b[31m[Server Error]\x1b[0m`, err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Server Port & Bootstrap
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
\x1b[32m====================================================\x1b[0m
\x1b[1m🚀 PRAMAN Backend Engine Running\x1b[0m
\x1b[34m- Port:\x1b[0m        http://localhost:${PORT}
\x1b[34m- Health API:\x1b[0m  http://localhost:${PORT}/api/health
\x1b[34m- Mode:\x1b[0m        ${process.env.NODE_ENV || 'development'}
\x1b[32m====================================================\x1b[0m
`);
  // Connect to DB asynchronously
  connectDB();
});

export { app, io, httpServer };
