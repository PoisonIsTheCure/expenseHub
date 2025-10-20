import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getHouseholdExpenses,
} from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadReceipts } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all expenses
router.get('/', getAllExpenses);

// Create expense
router.post(
  '/',
  uploadReceipts,
  validate([
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
      .isIn([
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Education',
        'Travel',
        'Groceries',
        'Other',
      ])
      .withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('householdId').optional().isMongoId().withMessage('Invalid household ID'),
    body('currency')
      .optional()
      .isIn(['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
      .withMessage('Invalid currency'),
  ]),
  createExpense
);

// Get household expenses
router.get('/household/:householdId', getHouseholdExpenses);

// Get expense by ID
router.get('/:id', getExpenseById);

// Update expense
router.put(
  '/:id',
  validate([
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty'),
    body('category')
      .optional()
      .isIn([
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Education',
        'Travel',
        'Groceries',
        'Other',
      ])
      .withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
  ]),
  updateExpense
);

// Delete expense
router.delete('/:id', deleteExpense);

export default router;

