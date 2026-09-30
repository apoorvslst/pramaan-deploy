import express from 'express';
import {
  createCrac,
  updateCrac,
  getMyCracs,
  getAllCracs,
  getCracForBid,
  getAwardedContractsForCrac,
} from '../controllers/cracController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { upload, computeFileHashes } from '../middlewares/upload.js';

const router = express.Router();

// Officer creates CRAC review with photo proof upload
router.post(
  '/create',
  protect,
  authorize('OFFICER', 'ADMIN'),
  upload.array('photos', 5),
  computeFileHashes,
  createCrac
);

// Officer re-inspects / updates existing CRAC
router.put(
  '/update/:id',
  protect,
  authorize('OFFICER', 'ADMIN'),
  upload.array('photos', 5),
  computeFileHashes,
  updateCrac
);

router.post(
  '/update/:id',
  protect,
  authorize('OFFICER', 'ADMIN'),
  upload.array('photos', 5),
  computeFileHashes,
  updateCrac
);

// Bidder retrieves CRAC reviews issued for their awarded contracts
router.get('/my-cracs', protect, getMyCracs);

// Officer fetches contracts awarded that are pending CRAC inspection
router.get('/pending-contracts', protect, authorize('OFFICER', 'ADMIN'), getAwardedContractsForCrac);

// Officer/Auditor retrieves all issued CRACs
router.get('/all', protect, authorize('OFFICER', 'ADMIN', 'AUDITOR', 'CAG_AUDITOR'), getAllCracs);

// Fetch CRAC for a specific bid
router.get('/bid/:bidId', protect, getCracForBid);

export default router;
