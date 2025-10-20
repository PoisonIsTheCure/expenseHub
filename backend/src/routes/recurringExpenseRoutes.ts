import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllRecurringExpenses,
  createRecurringExpense,
  getRecurringExpenseById,
  updateRecurringExpense,
  deleteRecurringExpense,
  processRecurringExpenses,
} from '../controllers/recurringExpenseController';

const router = express.Router();

// All recurring expense routes require authentication
router.use(authenticate);

// Get all recurring expenses
router.get('/', getAllRecurringExpenses);

// Process recurring expenses (create due expenses)
router.post('/process', processRecurringExpenses);

// Create a new recurring expense
router.post('/', createRecurringExpense);

// Get a specific recurring expense
router.get('/:id', getRecurringExpenseById);

// Update a recurring expense
router.put('/:id', updateRecurringExpense);

// Delete a recurring expense
router.delete('/:id', deleteRecurringExpense);

export default router;

