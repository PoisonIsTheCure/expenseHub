import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPersonalAnalytics,
  getHouseholdAnalytics,
  compareMonths,
  getCategoryTrends,
} from '../controllers/analyticsController';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

// Get personal analytics
router.get('/personal', getPersonalAnalytics);

// Get household analytics
router.get('/household/:householdId', getHouseholdAnalytics);

// Compare months
router.get('/compare-months', compareMonths);

// Get category trends
router.get('/trends', getCategoryTrends);

export default router;

