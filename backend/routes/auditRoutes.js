import express from 'express';
import {
  getChainByTender,
  verifyChainIntegrity,
  getAllBlocks,
  getCAGReport,
} from '../controllers/auditController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Verify cryptographic integrity of the hash chain
router.get('/verify', protect, verifyChainIntegrity);
router.get('/verify/:tenderId', protect, verifyChainIntegrity);

// Get all audit blocks for a specific tender (including its bid submissions)
router.get('/chain/:tenderId', protect, getChainByTender);

// Export CAG-compliant audit dossier
router.get('/cag-report/:tenderId', protect, authorize('OFFICER', 'AUDITOR', 'CAG_AUDITOR'), getCAGReport);

// View global paginated ledger blocks
router.get('/blocks', protect, authorize('OFFICER', 'AUDITOR', 'CAG_AUDITOR'), getAllBlocks);

export default router;
