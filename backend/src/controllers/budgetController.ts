import { Response } from 'express';
import { User } from '../models/User';
import { Household } from '../models/Household';
import { Expense } from '../models/Expense';
import { AuthRequest } from '../types';

// Get personal budget information
export const getPersonalBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    const user = await User.findById(userId).select('personalBudget name email');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Calculate current month's spending
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const personalExpenses = await Expense.find({
      ownerId: userId,
      householdId: { $exists: false },
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSpent = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = user.personalBudget || { monthlyLimit: 0, currency: 'EUR', resetDate: new Date() };
    
    const monthlyLimit = budget.monthlyLimit ?? 0;
    const currency = budget.currency || 'EUR';
    
    const budgetInfo = {
      monthlyLimit,
      currency,
      totalSpent,
      remaining: monthlyLimit - totalSpent,
      percentageUsed: monthlyLimit > 0 ? (totalSpent / monthlyLimit) * 100 : 0,
      resetDate: budget.resetDate,
      expenses: personalExpenses,
    };

    res.json({ budget: budgetInfo });
  } catch (error: any) {
    console.error('Error getting personal budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update personal budget
export const updatePersonalBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { monthlyLimit, currency } = req.body;

    if (monthlyLimit !== undefined && monthlyLimit < 0) {
      res.status(400).json({ message: 'Monthly limit must be positive' });
      return;
    }

    const updateData: any = {};
    if (monthlyLimit !== undefined) {
      updateData['personalBudget.monthlyLimit'] = monthlyLimit;
    }
    if (currency) {
      updateData['personalBudget.currency'] = currency;
    }

    // Set reset date to next month if budget is being set for the first time
    if (monthlyLimit !== undefined) {
      const now = new Date();
      updateData['personalBudget.resetDate'] = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: 'personalBudget name email' }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Calculate current month's spending for updated budget info
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const personalExpenses = await Expense.find({
      ownerId: userId,
      householdId: { $exists: false },
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSpent = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = user.personalBudget || { monthlyLimit: 0, currency: 'EUR', resetDate: new Date() };
    
    const monthlyLimitValue = budget.monthlyLimit ?? 0;
    const currencyValue = budget.currency || 'EUR';
    
    const budgetInfo = {
      monthlyLimit: monthlyLimitValue,
      currency: currencyValue,
      totalSpent,
      remaining: monthlyLimitValue - totalSpent,
      percentageUsed: monthlyLimitValue > 0 ? (totalSpent / monthlyLimitValue) * 100 : 0,
      resetDate: budget.resetDate,
      expenses: personalExpenses,
    };

    res.json({
      message: 'Personal budget updated successfully',
      budget: budgetInfo,
    });
  } catch (error: any) {
    console.error('Error updating personal budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get household budget information
export const getHouseholdBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId } = req.params;

    const household = await Household.findById(householdId).populate('members', 'name email');
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    if (!household.members.some((member: any) => member._id.toString() === userId)) {
      res.status(403).json({ message: 'Not a member of this household' });
      return;
    }

    // Calculate current month's spending
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const householdExpenses = await Expense.find({
      householdId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate('ownerId', 'name email');

    const totalSpent = householdExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = household.budget || { monthlyLimit: 0, currency: 'EUR', contributions: [] };
    
    const monthlyLimit = budget.monthlyLimit ?? 0;
    const currency = budget.currency || 'EUR';
    const contributions = budget.contributions || [];
    const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    
    const budgetInfo = {
      monthlyLimit,
      currency,
      totalSpent,
      totalContributions,
      remaining: monthlyLimit - totalSpent,
      percentageUsed: monthlyLimit > 0 ? (totalSpent / monthlyLimit) * 100 : 0,
      contributions,
      expenses: householdExpenses,
    };

    res.json({ budget: budgetInfo });
  } catch (error: any) {
    console.error('Error getting household budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update household budget
export const updateHouseholdBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId } = req.params;
    const { monthlyLimit, currency } = req.body;

    const household = await Household.findById(householdId);
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    if (!household.members.includes(userId!)) {
      res.status(403).json({ message: 'Not a member of this household' });
      return;
    }

    if (monthlyLimit !== undefined && monthlyLimit < 0) {
      res.status(400).json({ message: 'Monthly limit must be positive' });
      return;
    }

    const updateData: any = {};
    if (monthlyLimit !== undefined) {
      updateData['budget.monthlyLimit'] = monthlyLimit;
    }
    if (currency) {
      updateData['budget.currency'] = currency;
    }

    const updatedHousehold = await Household.findByIdAndUpdate(
      householdId,
      { $set: updateData },
      { new: true }
    ).populate('members', 'name email');

    if (!updatedHousehold) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Calculate current month's spending for updated budget info
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const householdExpenses = await Expense.find({
      householdId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate('ownerId', 'name email');

    const totalSpent = householdExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = updatedHousehold.budget || { monthlyLimit: 0, currency: 'EUR', contributions: [] };
    
    const monthlyLimitValue = budget.monthlyLimit ?? 0;
    const currencyValue = budget.currency || 'EUR';
    const contributions = budget.contributions || [];
    const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    
    const budgetInfo = {
      monthlyLimit: monthlyLimitValue,
      currency: currencyValue,
      totalSpent,
      totalContributions,
      remaining: monthlyLimitValue - totalSpent,
      percentageUsed: monthlyLimitValue > 0 ? (totalSpent / monthlyLimitValue) * 100 : 0,
      contributions,
      expenses: householdExpenses,
    };

    res.json({
      message: 'Household budget updated successfully',
      budget: budgetInfo,
    });
  } catch (error: any) {
    console.error('Error updating household budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add contribution to household budget
export const addHouseholdContribution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Contribution amount must be positive' });
      return;
    }

    const household = await Household.findById(householdId);
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    if (!household.members.includes(userId!)) {
      res.status(403).json({ message: 'Not a member of this household' });
      return;
    }

    const contribution = {
      userId,
      amount: parseFloat(amount),
      date: new Date(),
    };

    const updatedHousehold = await Household.findByIdAndUpdate(
      householdId,
      { $push: { 'budget.contributions': contribution } },
      { new: true }
    ).populate('budget.contributions.userId', 'name email');

    if (!updatedHousehold) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Calculate current month's spending for updated budget info
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const householdExpenses = await Expense.find({
      householdId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate('ownerId', 'name email');

    const totalSpent = householdExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = updatedHousehold.budget || { monthlyLimit: 0, currency: 'EUR', contributions: [] };
    
    const monthlyLimit = budget.monthlyLimit ?? 0;
    const currency = budget.currency || 'EUR';
    const contributions = budget.contributions || [];
    const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    
    const budgetInfo = {
      monthlyLimit,
      currency,
      totalSpent,
      totalContributions,
      remaining: monthlyLimit - totalSpent,
      percentageUsed: monthlyLimit > 0 ? (totalSpent / monthlyLimit) * 100 : 0,
      contributions,
      expenses: householdExpenses,
    };

    res.json({
      message: 'Contribution added successfully',
      contribution,
      budget: budgetInfo,
    });
  } catch (error: any) {
    console.error('Error adding household contribution:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
