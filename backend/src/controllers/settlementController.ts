import { Response } from 'express';
import { Settlement } from '../models/Settlement';
import { Household } from '../models/Household';
import { Expense } from '../models/Expense';
import { AuthRequest } from '../types';
import { calculateHouseholdBalances, simplifyDebts } from '../services/calculationService';

export const getHouseholdBalances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { householdId } = req.params;
    const userId = req.user?.id;

    // Verify user is a member of the household
    const household = await Household.findById(householdId);
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    if (!household.members.includes(userId!)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Get all household expenses
    const expenses = await Expense.find({ householdId });

    // Calculate balances
    const balances = await calculateHouseholdBalances(householdId, expenses);

    // Get simplified debt relationships
    const debts = simplifyDebts(balances);

    res.json({
      householdId,
      householdName: household.name,
      balances,
      debts,
      currency: household.budget?.currency || 'EUR',
    });
  } catch (error: any) {
    console.error('Error calculating balances:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createSettlement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { householdId, toUserId, amount, notes } = req.body;
    const fromUserId = req.user?.id;

    if (!fromUserId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Validate required fields
    if (!householdId || !toUserId || !amount || amount <= 0) {
      res.status(400).json({ message: 'Household ID, recipient, and positive amount are required' });
      return;
    }

    // Verify household exists and user is a member
    const household = await Household.findById(householdId);
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    if (!household.members.includes(fromUserId) || !household.members.includes(toUserId)) {
      res.status(403).json({ message: 'Both users must be members of the household' });
      return;
    }

    // Create settlement
    const settlementData = {
      householdId,
      fromUserId,
      toUserId,
      amount: parseFloat(amount),
      currency: household.budget?.currency || 'EUR',
      status: 'pending' as const,
      notes: notes || undefined,
      proofOfPayment: req.files && (req.files as any[])[0] ? {
        filename: (req.files as any[])[0].filename,
        originalName: (req.files as any[])[0].originalname,
        mimetype: (req.files as any[])[0].mimetype,
        size: (req.files as any[])[0].size,
        url: `/uploads/${(req.files as any[])[0].filename}`,
      } : undefined,
    };

    const settlement = await Settlement.create(settlementData);

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .populate('householdId', 'name');

    res.status(201).json({
      message: 'Settlement created successfully',
      settlement: populatedSettlement,
    });
  } catch (error: any) {
    console.error('Error creating settlement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHouseholdSettlements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { householdId } = req.params;
    const userId = req.user?.id;

    // Verify user is a member of the household
    const household = await Household.findById(householdId);
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    if (!household.members.includes(userId!)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const settlements = await Settlement.find({ householdId })
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ settlements });
  } catch (error: any) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateSettlementStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const settlement = await Settlement.findById(id);
    if (!settlement) {
      res.status(404).json({ message: 'Settlement not found' });
      return;
    }

    // Only the recipient (toUserId) can mark as completed
    // Only the sender (fromUserId) can cancel
    if (status === 'completed' && settlement.toUserId.toString() !== userId) {
      res.status(403).json({ message: 'Only the recipient can mark as completed' });
      return;
    }

    if (status === 'cancelled' && settlement.fromUserId.toString() !== userId) {
      res.status(403).json({ message: 'Only the sender can cancel' });
      return;
    }

    settlement.status = status;
    if (status === 'completed') {
      settlement.settlementDate = new Date();
    }

    await settlement.save();

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .populate('householdId', 'name');

    res.json({
      message: 'Settlement status updated successfully',
      settlement: populatedSettlement,
    });
  } catch (error: any) {
    console.error('Error updating settlement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserSettlements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const settlements = await Settlement.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .populate('householdId', 'name')
      .sort({ createdAt: -1 });

    res.json({ settlements });
  } catch (error: any) {
    console.error('Error fetching user settlements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

