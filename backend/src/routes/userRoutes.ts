import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put(
  '/:id',
  validate([
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
  ]),
  updateUser
);

// Delete user
router.delete('/:id', deleteUser);

export default router;

