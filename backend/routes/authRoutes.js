import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserIncome,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/income', protect, updateUserIncome);

export default router;
