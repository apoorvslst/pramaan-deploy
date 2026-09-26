import express from 'express';
import {
  submitBid,
  getMySubmissions,
  getSubmissionById,
  getSubmissionsForTender,
} from '../controllers/bidController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { upload, computeFileHashes } from '../middlewares/upload.js';

const router = express.Router();

// Bidder submission route with multipart file upload and SHA-256 fingerprinting
router.post(
  '/submit',
  protect,
  upload.any(),
  computeFileHashes,
  submitBid
);

// Bidder view their own submissions
router.get('/my-submissions', protect, getMySubmissions);

// Officer & Auditor view all submissions for a tender
router.get('/tender/:tenderId', protect, authorize('OFFICER', 'AUDITOR', 'CAG_AUDITOR'), getSubmissionsForTender);

// View specific submission details
router.get('/:id', protect, getSubmissionById);

export default router;
