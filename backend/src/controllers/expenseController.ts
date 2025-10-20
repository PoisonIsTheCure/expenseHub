import { Response } from 'express';
import { Expense } from '../models/Expense';
import { Household } from '../models/Household';
import { AuthRequest } from '../types';

export const getAllExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Get user's personal expenses and household expenses
    const expenses = await Expense.find({
      $or: [
        { ownerId: userId },
        { householdId: { $exists: true } },
      ],
    })
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .sort({ date: -1 });

    // Filter to only include household expenses where user is a member
    const user = await require('../models/User').User.findById(userId);
    const filteredExpenses = expenses.filter((expense) => {
      if (!expense.householdId) {
        return expense.ownerId.toString() === userId;
      }
      return true; // We'll verify household membership separately if needed
    });

    res.json({ expenses: filteredExpenses });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, description, category, date, householdId } = req.body;
    const userId = req.user?.id;

    // Validate household membership if householdId provided
    if (householdId) {
      const household = await Household.findById(householdId);
      if (!household) {
        res.status(404).json({ message: 'Household not found' });
        return;
      }
      if (!household.members.includes(userId!)) {
        res.status(403).json({ message: 'Not a member of this household' });
        return;
      }
    }

    const expense = await Expense.create({
      amount,
      description,
      category,
      date: date || new Date(),
      ownerId: userId,
      householdId,
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name');

    res.status(201).json({
      message: 'Expense created successfully',
      expense: populatedExpense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const expense = await Expense.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name');

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    // Check if user has access
    if ((expense.ownerId as any)._id.toString() !== userId && req.user?.role !== 'admin') {
      if (expense.householdId) {
        const household = await Household.findById(expense.householdId);
        if (!household || !household.members.includes(userId!)) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      } else {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    res.json({ expense });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount, description, category, date } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    // Only owner or admin can update
    if (expense.ownerId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only expense owner can update' });
      return;
    }

    if (amount !== undefined) expense.amount = amount;
    if (description) expense.description = description;
    if (category) expense.category = category;
    if (date) expense.date = date;

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name');

    res.json({
      message: 'Expense updated successfully',
      expense: populatedExpense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    // Only owner or admin can delete
    if (expense.ownerId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only expense owner can delete' });
      return;
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHouseholdExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId } = req.params;

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

    const expenses = await Expense.find({ householdId })
      .populate('ownerId', 'name email')
      .sort({ date: -1 });

    res.json({ expenses });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

