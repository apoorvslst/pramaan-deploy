import mongoose from 'mongoose';
import { CircuitBreaker } from '../middlewares/chaos.js';

/**
 * @desc    Deep system health check with chaos engineering telemetry
 * @route   GET /api/system/health
 * @access  Public
 */
export const deepHealthCheck = async (req, res) => {
  const startTime = process.hrtime.bigint();

  // Database latency probe
  let dbLatencyMs = -1;
  let dbStatus = 'disconnected';
  try {
    const dbStart = Date.now();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'connected';
    }
  } catch {
    dbStatus = 'error';
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  // Uptime
  const uptimeSeconds = process.uptime();
  const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`;

  const endTime = process.hrtime.bigint();
  const healthCheckLatencyMs = Number(endTime - startTime) / 1_000_000;

  const circuitBreakerStates = CircuitBreaker.getStatus();

  return res.status(200).json({
    success: true,
    service: 'PRAMAN Verification Engine',
    version: '2.0.0-chaos',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    healthCheckLatencyMs: Number(healthCheckLatencyMs.toFixed(2)),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
    memory: {
      heapUsed: formatMB(memUsage.heapUsed),
      heapTotal: formatMB(memUsage.heapTotal),
      rss: formatMB(memUsage.rss),
      external: formatMB(memUsage.external),
      arrayBuffers: formatMB(memUsage.arrayBuffers || 0),
    },
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      formatted: uptimeFormatted,
    },
    circuitBreakers: circuitBreakerStates,
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid,
  });
};

/**
 * @desc    Circuit breaker management — view & reset circuits
 * @route   GET /api/system/circuits
 * @access  Private (ADMIN)
 */
export const getCircuitStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    circuits: CircuitBreaker.getStatus(),
    timestamp: new Date().toISOString(),
  });
};

/**
 * @desc    Liveness probe (Kubernetes / Docker)
 * @route   GET /api/system/liveness
 * @access  Public
 */
export const liveness = (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
};

/**
 * @desc    Readiness probe (Kubernetes / Docker)
 * @route   GET /api/system/readiness
 * @access  Public
 */
export const readiness = async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;

  if (!dbReady) {
    return res.status(503).json({
      status: 'not_ready',
      reason: 'Database connection is not established.',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    status: 'ready',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
};

export default {
  deepHealthCheck,
  getCircuitStatus,
  liveness,
  readiness,
};
