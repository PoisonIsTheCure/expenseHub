import express from 'express';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';
import {
  getHouseholdBalances,
  createSettlement,
  getHouseholdSettlements,
  updateSettlementStatus,
  getUserSettlements,
} from '../controllers/settlementController';

const router = express.Router();

// All settlement routes require authentication
router.use(authenticate);

// Get balances for a household
router.get('/households/:householdId/balances', getHouseholdBalances);

// Get settlements for a household
router.get('/households/:householdId', getHouseholdSettlements);

// Get user's settlements
router.get('/user', getUserSettlements);

// Create a new settlement
router.post('/', upload.array('proofOfPayment', 1), createSettlement);

// Update settlement status
router.patch('/:id/status', updateSettlementStatus);

export default router;

