import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  transferBudget,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCategories)
  .post(protect, createCategory);

router.post('/transfer', protect, transferBudget);

router.route('/:id')
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;
