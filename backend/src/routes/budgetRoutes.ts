import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPersonalBudget,
  updatePersonalBudget,
  getHouseholdBudget,
  updateHouseholdBudget,
  addHouseholdContribution,
} from '../controllers/budgetController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Personal budget routes
router.get('/personal', getPersonalBudget);
router.put(
  '/personal',
  validate([
    body('monthlyLimit')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monthly limit must be a positive number'),
    body('currency')
      .optional()
      .isIn(['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
      .withMessage('Invalid currency'),
  ]),
  updatePersonalBudget
);

// Household budget routes
router.get('/household/:householdId', getHouseholdBudget);
router.put(
  '/household/:householdId',
  validate([
    body('monthlyLimit')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monthly limit must be a positive number'),
    body('currency')
      .optional()
      .isIn(['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
      .withMessage('Invalid currency'),
  ]),
  updateHouseholdBudget
);

// Add contribution to household budget
router.post(
  '/household/:householdId/contribution',
  validate([
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Contribution amount must be a positive number'),
  ]),
  addHouseholdContribution
);

export default router;
