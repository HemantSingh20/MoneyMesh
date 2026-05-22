import express from 'express';
import {
  createTrip,
  joinTrip,
  getTrips,
  getTripDetails,
  addTripExpense,
  deleteTripExpense,
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createTrip)
  .get(protect, getTrips);

router.post('/join', protect, joinTrip);

router.route('/:id')
  .get(protect, getTripDetails);

router.route('/:id/expenses')
  .post(protect, addTripExpense);

router.route('/:id/expenses/:expenseId')
  .delete(protect, deleteTripExpense);

export default router;
