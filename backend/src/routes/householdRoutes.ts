import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllHouseholds,
  createHousehold,
  getHouseholdById,
  updateHousehold,
  deleteHousehold,
  joinHousehold,
  leaveHousehold,
  addMemberByEmail,
  removeMember,
  addContribution,
  getContributionStats,
  updateHouseholdBudget,
} from '../controllers/householdController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all households (user's households)
router.get('/', getAllHouseholds);

// Create household
router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('Household name is required'),
  ]),
  createHousehold
);

// Get household by ID
router.get('/:id', getHouseholdById);

// Update household
router.put(
  '/:id',
  validate([
    body('name').trim().notEmpty().withMessage('Household name is required'),
  ]),
  updateHousehold
);

// Delete household
router.delete('/:id', deleteHousehold);

// Join household
router.post('/:id/join', joinHousehold);

// Leave household
router.post('/:id/leave', leaveHousehold);

// Add member by email
router.post(
  '/:id/members',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  addMemberByEmail
);

// Remove member
router.delete('/:id/members/:memberId', removeMember);

// Add contribution
router.post(
  '/:id/contributions',
  validate([
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  ]),
  addContribution
);

// Get contribution statistics
router.get('/:id/contributions/stats', getContributionStats);

// Update household budget
router.put('/:id/budget', updateHouseholdBudget);

export default router;

