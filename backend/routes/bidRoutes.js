import express from 'express';
import {
  submitBid,
  getMySubmissions,
  getSubmissionById,
  getSubmissionsForTender,
  getAllSubmissions,
} from '../controllers/bidController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { upload, computeFileHashes } from '../middlewares/upload.js';

const router = express.Router();

// List all submissions (accessible by authenticated users, or for dashboard)
router.get('/', getAllSubmissions);

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

// View all open submissions for a tender (accessible by authenticated users: Bidders, Officers, Auditors)
router.get('/tender/:tenderId', protect, getSubmissionsForTender);

// View specific submission details
router.get('/:id', protect, getSubmissionById);

export default router;
