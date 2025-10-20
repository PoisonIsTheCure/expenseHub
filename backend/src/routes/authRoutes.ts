import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Register new user (admin only)
router.post(
  '/register',
  authenticate,
  authorize('admin'),
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
  ]),
  register
);

// Login
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

// Get current user
router.get('/me', authenticate, getMe);

export default router;

