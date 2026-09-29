import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

// ─── Route Imports ───
import authRoutes from './routes/authRoutes.js';
import tenderRoutes from './routes/tenderRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import forensicsRoutes from './routes/forensicsRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// ─── Chaos Engineering & Resilience Middleware ───
import {
  rateLimiter,
  correlationId,
  timeoutGuard,
  idempotencyGuard,
  chaosMonkey,
  securityHeaders,
  requestSanitizer,
} from './middlewares/chaos.js';

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

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE PIPELINE (Order matters!)
// ═══════════════════════════════════════════════════════════════

// Layer 1: Security Headers (OWASP hardening)
app.use(securityHeaders);
app.use(helmet({ crossOriginResourcePolicy: false }));

// Layer 2: CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Layer 3: Request Correlation ID (X-Request-ID propagation for distributed tracing)
app.use(correlationId);

// Layer 4: Request Logging (with correlation ID in log)
app.use(morgan((tokens, req, res) => {
  return [
    `[${req.correlationId?.substring(0, 8) || '--------'}]`,
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    '-', tokens.res(req, res, 'content-length') || '0', 'bytes',
  ].join(' ');
}));

// Layer 5: Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Layer 6: NoSQL Injection Sanitizer
app.use(requestSanitizer);

// Layer 7: Rate Limiter (sliding window, per-IP)
app.use('/api/', rateLimiter({ maxRequests: 100, windowMs: 60_000 }));

// Layer 8: Idempotency Key Enforcement (for POST/PUT/PATCH)
app.use(idempotencyGuard);

// Layer 9: Request Timeout Guardian (30s default)
app.use(timeoutGuard(30_000));

// Layer 10: Chaos Monkey (disabled by default, enable via CHAOS_ENABLED=true)
app.use(chaosMonkey());

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO REAL-TIME EVENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// ROOT & HEALTH ROUTES
// ═══════════════════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.json({
    name: 'PRAMAN API Engine',
    version: '2.0.0-chaos',
    description: 'Autonomous AI-Powered Public Procurement Bid Verification Engine with Chaos Engineering',
    status: 'Active',
    resilience: {
      circuitBreaker: 'ENABLED',
      rateLimiter: 'ENABLED',
      correlationId: 'ENABLED',
      timeoutGuard: 'ENABLED',
      idempotency: 'ENABLED',
      noSQLSanitizer: 'ENABLED',
      chaosMonkey: process.env.CHAOS_ENABLED === 'true' ? 'ARMED' : 'DISABLED',
    },
    endpoints: {
      health: '/api/health',
      deepHealth: '/api/system/health',
      liveness: '/api/system/liveness',
      readiness: '/api/system/readiness',
      auth: '/api/auth',
      tenders: '/api/tenders',
      bids: '/api/bids',
      verification: '/api/verify',
      audit: '/api/audit',
      forensics: '/api/forensics',
      system: '/api/system',
      ai: '/api/ai',
    },
  });
});

// Basic Health Check (backwards compatible)
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
    version: '2.0.0-chaos',
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
      code: dbState,
    },
    uptime: `${process.uptime().toFixed(1)}s`,
  });
});

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/forensics', forensicsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ai', aiRoutes);

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    correlationId: req.correlationId,
    suggestion: 'Check /api endpoints. Use GET / for a complete endpoint listing.',
  });
});

// Global Error Handler (with correlation ID for debugging)
app.use((err, req, res, next) => {
  const correlationId = req.correlationId || 'unknown';
  console.error(`\x1b[31m[Server Error]\x1b[0m [${correlationId}]`, err.stack || err.message);

  // Handle Mongoose validation errors gracefully
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages,
      correlationId,
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid ${err.path}: ${err.value}`,
      correlationId,
    });
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      error: `Duplicate value for field: ${field}`,
      correlationId,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    correlationId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ═══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN (Chaos Engineering Best Practice)
// ═══════════════════════════════════════════════════════════════
const gracefulShutdown = async (signal) => {
  console.log(`\n\x1b[33m[Shutdown]\x1b[0m Received ${signal}. Initiating graceful shutdown...`);

  // 1. Stop accepting new connections
  httpServer.close(() => {
    console.log('\x1b[33m[Shutdown]\x1b[0m HTTP server closed.');
  });

  // 2. Close Socket.io connections
  io.close(() => {
    console.log('\x1b[33m[Shutdown]\x1b[0m Socket.io server closed.');
  });

  // 3. Close MongoDB connection
  try {
    await mongoose.connection.close();
    console.log('\x1b[33m[Shutdown]\x1b[0m MongoDB connection closed.');
  } catch (err) {
    console.error('\x1b[31m[Shutdown Error]\x1b[0m MongoDB close error:', err.message);
  }

  console.log('\x1b[32m[Shutdown]\x1b[0m Graceful shutdown complete. Goodbye! 👋');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled promise rejections (Chaos Engineering resilience)
process.on('unhandledRejection', (reason, promise) => {
  console.error('\x1b[31m[Unhandled Rejection]\x1b[0m', reason);
  // Don't crash — log and continue (chaos-resilient)
});

process.on('uncaughtException', (error) => {
  console.error('\x1b[31m[Uncaught Exception]\x1b[0m', error);
  // In production, you'd want to restart after cleanup
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

// ═══════════════════════════════════════════════════════════════
// SERVER BOOTSTRAP
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
\x1b[32m════════════════════════════════════════════════════════\x1b[0m
\x1b[1m🚀 PRAMAN Backend Engine v2.0.0 (Chaos-Hardened)\x1b[0m
\x1b[34m┌─ Port:           \x1b[0m http://localhost:${PORT}
\x1b[34m├─ Health API:     \x1b[0m http://localhost:${PORT}/api/health
\x1b[34m├─ Deep Health:    \x1b[0m http://localhost:${PORT}/api/system/health
\x1b[34m├─ Forensics:      \x1b[0m http://localhost:${PORT}/api/forensics
\x1b[34m├─ Mode:           \x1b[0m ${process.env.NODE_ENV || 'development'}
\x1b[34m├─ Chaos Monkey:   \x1b[0m ${process.env.CHAOS_ENABLED === 'true' ? '🐒 ARMED' : '🔒 DISABLED'}
\x1b[34m└─ Resilience:     \x1b[0m Circuit Breaker ✓ | Rate Limiter ✓ | Sanitizer ✓
\x1b[32m════════════════════════════════════════════════════════\x1b[0m
`);
  // Connect to DB asynchronously
  connectDB();
});

export { app, io, httpServer };
