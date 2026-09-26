import express from 'express';
import {
  deepHealthCheck,
  getCircuitStatus,
  liveness,
  readiness,
} from '../controllers/systemController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Deep health check with DB latency, memory, circuit breaker status
router.get('/health', deepHealthCheck);

// Circuit breaker dashboard
router.get('/circuits', protect, authorize('ADMIN', 'OFFICER', 'AUDITOR'), getCircuitStatus);

// Kubernetes/Docker probes
router.get('/liveness', liveness);
router.get('/readiness', readiness);

export default router;
