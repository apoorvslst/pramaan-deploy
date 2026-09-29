import express from 'express';
import { register, login, getMe, logout, verifyKyc } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/kyc/verify', protect, verifyKyc);

export default router;

