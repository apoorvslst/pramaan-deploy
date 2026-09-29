import express from 'express';
import {
  createTender,
  getAllTenders,
  getTenderById,
  updateTender,
  publishTender,
  generateAITenderDraft,
} from '../controllers/tenderController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllTenders)
  .post(protect, authorize('OFFICER'), createTender);

router.post('/ai-assist', protect, authorize('OFFICER'), generateAITenderDraft);

router.route('/:id')
  .get(getTenderById)
  .put(protect, authorize('OFFICER'), updateTender);

router.patch('/:id/publish', protect, authorize('OFFICER'), publishTender);

export default router;

