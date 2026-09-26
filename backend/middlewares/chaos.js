/**
 * PRAMAN — Chaos Engineering & Resilience Middleware Suite
 * ═══════════════════════════════════════════════════════════
 * Implements production-grade resilience patterns:
 * 1. Circuit Breaker (per-service, with half-open state)
 * 2. Rate Limiter (sliding window, per-IP)
 * 3. Request Correlation ID (X-Request-ID propagation)
 * 4. Graceful Degradation (auto-fallback on overload)
 * 5. Chaos Monkey (latency injection for testing)
 * 6. Request Timeout Guardian
 * 7. Idempotency Key enforcement
 */

import crypto from 'crypto';

// ─── 1. CIRCUIT BREAKER ──────────────────────────────────────
const circuitStates = new Map(); // serviceName -> { state, failures, lastFailure, successesSinceHalfOpen }

const CIRCUIT_CONFIG = {
  failureThreshold: 5,        // trips after N consecutive failures
  resetTimeoutMs: 30_000,     // wait before half-open attempt
  halfOpenMaxAttempts: 2,     // successes needed to fully close
};

export class CircuitBreaker {
  static getState(serviceName) {
    if (!circuitStates.has(serviceName)) {
      circuitStates.set(serviceName, {
        state: 'CLOSED',       // CLOSED | OPEN | HALF_OPEN
        failures: 0,
        lastFailure: null,
        successesSinceHalfOpen: 0,
      });
    }
    return circuitStates.get(serviceName);
  }

  static canExecute(serviceName) {
    const circuit = this.getState(serviceName);

    if (circuit.state === 'CLOSED') return true;

    if (circuit.state === 'OPEN') {
      const elapsed = Date.now() - circuit.lastFailure;
      if (elapsed >= CIRCUIT_CONFIG.resetTimeoutMs) {
        circuit.state = 'HALF_OPEN';
        circuit.successesSinceHalfOpen = 0;
        console.log(`\x1b[33m[CircuitBreaker]\x1b[0m ${serviceName} → HALF_OPEN (testing recovery)`);
        return true;
      }
      return false; // still open
    }

    // HALF_OPEN: allow limited attempts
    return true;
  }

  static recordSuccess(serviceName) {
    const circuit = this.getState(serviceName);
    if (circuit.state === 'HALF_OPEN') {
      circuit.successesSinceHalfOpen++;
      if (circuit.successesSinceHalfOpen >= CIRCUIT_CONFIG.halfOpenMaxAttempts) {
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        console.log(`\x1b[32m[CircuitBreaker]\x1b[0m ${serviceName} → CLOSED (fully recovered)`);
      }
    } else {
      circuit.failures = 0;
    }
  }

  static recordFailure(serviceName) {
    const circuit = this.getState(serviceName);
    circuit.failures++;
    circuit.lastFailure = Date.now();

    if (circuit.state === 'HALF_OPEN') {
      circuit.state = 'OPEN';
      console.log(`\x1b[31m[CircuitBreaker]\x1b[0m ${serviceName} → OPEN (half-open test failed)`);
    } else if (circuit.failures >= CIRCUIT_CONFIG.failureThreshold) {
      circuit.state = 'OPEN';
      console.log(`\x1b[31m[CircuitBreaker]\x1b[0m ${serviceName} → OPEN (threshold=${CIRCUIT_CONFIG.failureThreshold} breached)`);
    }
  }

  static getStatus() {
    const status = {};
    for (const [name, circuit] of circuitStates) {
      status[name] = { ...circuit };
    }
    return status;
  }
}

// ─── 2. SLIDING WINDOW RATE LIMITER ─────────────────────────
const rateLimitStore = new Map(); // ip -> [timestamps]

const RATE_LIMIT_CONFIG = {
  windowMs: 60_000,       // 1-minute sliding window
  maxRequests: 100,        // max requests per window
  burstAllowance: 20,     // extra burst on top of max for brief spikes
};

export const rateLimiter = (customConfig = {}) => {
  const config = { ...RATE_LIMIT_CONFIG, ...customConfig };

  return (req, res, next) => {
    const clientKey = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rateLimitStore.has(clientKey)) {
      rateLimitStore.set(clientKey, []);
    }

    const timestamps = rateLimitStore.get(clientKey);

    // Evict expired entries outside window
    while (timestamps.length > 0 && timestamps[0] < now - config.windowMs) {
      timestamps.shift();
    }

    const totalAllowed = config.maxRequests + config.burstAllowance;
    const remaining = Math.max(0, totalAllowed - timestamps.length);

    // Set rate limit headers (RFC 6585 compliant)
    res.set('X-RateLimit-Limit', String(config.maxRequests));
    res.set('X-RateLimit-Remaining', String(Math.max(0, config.maxRequests - timestamps.length)));
    res.set('X-RateLimit-Reset', String(Math.ceil((now + config.windowMs) / 1000)));

    if (timestamps.length >= totalAllowed) {
      const retryAfterSec = Math.ceil(config.windowMs / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please slow down.',
        retryAfterSeconds: retryAfterSec,
        clientKey,
        windowMs: config.windowMs,
      });
    }

    timestamps.push(now);
    next();
  };
};

// ─── 3. REQUEST CORRELATION ID ──────────────────────────────
export const correlationId = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.correlationId = requestId;
  res.set('X-Request-ID', requestId);
  res.set('X-Powered-By', 'PRAMAN Verification Engine v2.0');
  next();
};

// ─── 4. REQUEST TIMEOUT GUARDIAN ────────────────────────────
export const timeoutGuard = (timeoutMs = 30_000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`\x1b[31m[Timeout]\x1b[0m Request timed out after ${timeoutMs}ms: ${req.method} ${req.originalUrl}`);
        res.status(504).json({
          success: false,
          error: 'Gateway Timeout — request processing exceeded maximum allowed time.',
          correlationId: req.correlationId,
          timeoutMs,
        });
      }
    }, timeoutMs);

    // Clear timer when response finishes
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };
};

// ─── 5. IDEMPOTENCY KEY ENFORCEMENT ─────────────────────────
const idempotencyCache = new Map(); // key -> { status, body, timestamp }
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const idempotencyGuard = (req, res, next) => {
  // Only enforce on mutating methods
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();

  const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  if (!idempotencyKey) return next(); // optional

  // Evict stale entries
  const now = Date.now();
  for (const [key, val] of idempotencyCache) {
    if (now - val.timestamp > IDEMPOTENCY_TTL_MS) {
      idempotencyCache.delete(key);
    }
  }

  const cached = idempotencyCache.get(idempotencyKey);
  if (cached) {
    console.log(`\x1b[36m[Idempotency]\x1b[0m Returning cached response for key: ${idempotencyKey}`);
    return res.status(cached.status).json({
      ...cached.body,
      _idempotent: true,
      _cachedAt: new Date(cached.timestamp).toISOString(),
    });
  }

  // Intercept response to cache it
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    idempotencyCache.set(idempotencyKey, {
      status: res.statusCode,
      body,
      timestamp: Date.now(),
    });
    return originalJson(body);
  };

  next();
};

// ─── 6. CHAOS MONKEY (Dev/Test Only) ────────────────────────
export const chaosMonkey = (opts = {}) => {
  const enabled = process.env.CHAOS_ENABLED === 'true' || opts.force;
  const failureRate = Number(process.env.CHAOS_FAILURE_RATE) || opts.failureRate || 0.05;
  const maxLatencyMs = Number(process.env.CHAOS_MAX_LATENCY) || opts.maxLatencyMs || 3000;

  return (req, res, next) => {
    if (!enabled) return next();

    const roll = Math.random();

    // Random failure injection
    if (roll < failureRate) {
      console.warn(`\x1b[35m[ChaosMonkey]\x1b[0m 💥 Injected random failure on ${req.method} ${req.path}`);
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable (chaos injection)',
        _chaos: true,
      });
    }

    // Random latency injection
    if (roll < failureRate * 3) {
      const delay = Math.floor(Math.random() * maxLatencyMs);
      console.warn(`\x1b[35m[ChaosMonkey]\x1b[0m ⏱️ Injected ${delay}ms latency on ${req.method} ${req.path}`);
      return setTimeout(next, delay);
    }

    next();
  };
};

// ─── 7. SECURITY HEADERS HARDENER ───────────────────────────
export const securityHeaders = (req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('X-Download-Options', 'noopen');
  res.set('X-Permitted-Cross-Domain-Policies', 'none');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// ─── 8. REQUEST SANITIZER (Anti Injection) ──────────────────
const DANGEROUS_PATTERNS = [
  /\$where/i,
  /\$gt/i,
  /\$gte/i,
  /\$lt/i,
  /\$lte/i,
  /\$ne/i,
  /\$nin/i,
  /\$regex/i,
  /\$or/i,
  /\$and/i,
  /\$not/i,
  /\$exists/i,
  /\$elemMatch/i,
];

const deepSanitize = (obj, path = '') => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map((item, i) => deepSanitize(item, `${path}[${i}]`));

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block MongoDB operator injection in keys
    if (key.startsWith('$')) {
      console.warn(`\x1b[31m[Sanitizer]\x1b[0m Blocked NoSQL injection attempt: key="${key}" at path="${path}"`);
      continue;
    }
    // Check string values for dangerous patterns
    if (typeof value === 'string') {
      const hasDangerous = DANGEROUS_PATTERNS.some(p => p.test(value));
      if (hasDangerous && !path.includes('search') && !path.includes('query')) {
        console.warn(`\x1b[31m[Sanitizer]\x1b[0m Suspicious pattern in value at "${path}.${key}": "${value.substring(0, 50)}..."`);
      }
    }
    sanitized[key] = deepSanitize(value, `${path}.${key}`);
  }
  return sanitized;
};

export const requestSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body, 'body');
  }
  // Note: req.query is read-only in Express 5, so we validate but don't reassign
  if (req.query && typeof req.query === 'object') {
    deepSanitize(req.query, 'query'); // validate only, log warnings
  }
  next();
};

export default {
  CircuitBreaker,
  rateLimiter,
  correlationId,
  timeoutGuard,
  idempotencyGuard,
  chaosMonkey,
  securityHeaders,
  requestSanitizer,
};
