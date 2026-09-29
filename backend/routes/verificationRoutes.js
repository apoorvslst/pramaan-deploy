import express from 'express';
import {
  triggerVerification,
  getEvidenceByBid,
  submitOfficerDecision,
  getTenderEvaluations,
} from '../controllers/verificationController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Trigger the full 5-stage automated verification pipeline
router.post('/:bidId', protect, authorize('OFFICER', 'AUDITOR', 'CAG_AUDITOR'), triggerVerification);
router.post('/:bidId/verify', protect, authorize('OFFICER', 'AUDITOR', 'CAG_AUDITOR'), triggerVerification);

// Retrieve 3-Pane evidence dataset for a bid
router.get('/:bidId/evidence', protect, getEvidenceByBid);

// Officer records final award/disqualification decision (with mandatory override justification)
router.post('/:bidId/decision', protect, authorize('OFFICER', 'ADMIN'), submitOfficerDecision);

// Ranked evaluations across all competing bidders on a tender
router.get('/tender/:tenderId/evaluations', protect, authorize('OFFICER', 'AUDITOR', 'CAG_AUDITOR'), getTenderEvaluations);

export default router;
