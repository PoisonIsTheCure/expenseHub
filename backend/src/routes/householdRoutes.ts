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

export default router;

