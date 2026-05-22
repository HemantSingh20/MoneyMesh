import express from 'express';
import { getRazorpayKey, createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/key', protect, getRazorpayKey);
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

export default router;
