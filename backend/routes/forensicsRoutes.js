import express from 'express';
import {
  runCollusionAnalysis,
  runAnomalyDetection,
  getForensicDashboard,
} from '../controllers/forensicsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Cartel & collusion graph analysis for all bidders on a tender
router.get('/:tenderId/collusion', protect, authorize('OFFICER', 'AUDITOR', 'ADMIN'), runCollusionAnalysis);
router.post('/:tenderId/collusion', protect, authorize('OFFICER', 'AUDITOR', 'ADMIN'), runCollusionAnalysis);

// Anomaly detection on a specific bid submission
router.post('/:bidId/anomalies', protect, authorize('OFFICER', 'AUDITOR', 'ADMIN'), runAnomalyDetection);

// Full forensic dashboard combining collusion + anomaly analysis
router.get('/:tenderId/dashboard', protect, authorize('OFFICER', 'AUDITOR', 'ADMIN'), getForensicDashboard);

export default router;
