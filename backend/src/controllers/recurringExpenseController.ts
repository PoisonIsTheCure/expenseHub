import { Response } from 'express';
import { RecurringExpense } from '../models/RecurringExpense';
import { Expense } from '../models/Expense';
import { Household } from '../models/Household';
import { AuthRequest } from '../types';
import { calculateNextOccurrence, calculateSplitDetails } from '../services/calculationService';

export const getAllRecurringExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get user's personal recurring expenses
    const personalRecurring = await RecurringExpense.find({
      ownerId: userId,
      householdId: { $exists: false },
    })
      .populate('ownerId', 'name email')
      .populate('paidBy', 'name email')
      .sort({ nextOccurrence: 1 });

    // Get households where user is a member
    const households = await Household.find({ members: userId });
    const householdIds = households.map((h) => (h._id as any).toString());

    // Get household recurring expenses
    const householdRecurring = await RecurringExpense.find({
      householdId: { $in: householdIds },
    })
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .populate('paidBy', 'name email')
      .sort({ nextOccurrence: 1 });

    const allRecurring = [...personalRecurring, ...householdRecurring];

    res.json({ recurringExpenses: allRecurring });
  } catch (error: any) {
    console.error('Error fetching recurring expenses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createRecurringExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      amount,
      description,
      category,
      frequency,
      startDate,
      endDate,
      householdId,
      currency,
      splitMethod,
      splitDetails,
      paidBy,
      reminderDays,
    } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!amount || !description || !category || !frequency) {
      res.status(400).json({
        message: 'Amount, description, category, and frequency are required',
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Validate household membership if householdId provided
    let household = null;
    if (householdId) {
      household = await Household.findById(householdId);
      if (!household) {
        res.status(404).json({ message: 'Household not found' });
        return;
      }
      if (!household.members.includes(userId)) {
        res.status(403).json({ message: 'Not a member of this household' });
        return;
      }
    }

    const start = startDate ? new Date(startDate) : new Date();
    const nextOccurrence = calculateNextOccurrence(start, frequency);

    const recurringData = {
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      frequency,
      startDate: start,
      endDate: endDate ? new Date(endDate) : undefined,
      nextOccurrence,
      ownerId: userId,
      householdId: householdId || undefined,
      currency: currency || 'EUR',
      splitMethod: splitMethod || (householdId ? 'equal' : 'none'),
      splitDetails: splitDetails || [],
      paidBy: paidBy || userId,
      reminderDays: reminderDays !== undefined ? parseInt(reminderDays) : 3,
      isActive: true,
    };

    const recurringExpense = await RecurringExpense.create(recurringData);

    const populated = await RecurringExpense.findById(recurringExpense._id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .populate('paidBy', 'name email');

    res.status(201).json({
      message: 'Recurring expense created successfully',
      recurringExpense: populated,
    });
  } catch (error: any) {
    console.error('Error creating recurring expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getRecurringExpenseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const recurringExpense = await RecurringExpense.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .populate('paidBy', 'name email');

    if (!recurringExpense) {
      res.status(404).json({ message: 'Recurring expense not found' });
      return;
    }

    // Check if user has access
    const ownerIdString = (recurringExpense.ownerId as any)?._id?.toString() || 
                          (recurringExpense.ownerId as any)?.toString() || 
                          recurringExpense.ownerId;
    
    if (ownerIdString !== userId && req.user?.role !== 'admin') {
      if (recurringExpense.householdId) {
        const household = await Household.findById(recurringExpense.householdId);
        if (!household || !household.members.includes(userId!)) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      } else {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    res.json({ recurringExpense });
  } catch (error: any) {
    console.error('Error fetching recurring expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateRecurringExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      amount,
      description,
      category,
      frequency,
      endDate,
      currency,
      splitMethod,
      splitDetails,
      paidBy,
      reminderDays,
      isActive,
    } = req.body;

    const recurringExpense = await RecurringExpense.findById(req.params.id);
    if (!recurringExpense) {
      res.status(404).json({ message: 'Recurring expense not found' });
      return;
    }

    // Only owner or admin can update
    if (recurringExpense.ownerId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only expense owner can update' });
      return;
    }

    if (amount !== undefined) recurringExpense.amount = parseFloat(amount);
    if (description) recurringExpense.description = description.trim();
    if (category) recurringExpense.category = category;
    if (frequency) {
      recurringExpense.frequency = frequency;
      // Recalculate next occurrence if frequency changed
      recurringExpense.nextOccurrence = calculateNextOccurrence(
        recurringExpense.nextOccurrence,
        frequency
      );
    }
    if (endDate !== undefined) recurringExpense.endDate = endDate ? new Date(endDate) : undefined;
    if (currency) recurringExpense.currency = currency;
    if (splitMethod) recurringExpense.splitMethod = splitMethod;
    if (splitDetails) recurringExpense.splitDetails = splitDetails;
    if (paidBy) recurringExpense.paidBy = paidBy;
    if (reminderDays !== undefined) recurringExpense.reminderDays = parseInt(reminderDays);
    if (isActive !== undefined) recurringExpense.isActive = isActive;

    await recurringExpense.save();

    const populated = await RecurringExpense.findById(recurringExpense._id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .populate('paidBy', 'name email');

    res.json({
      message: 'Recurring expense updated successfully',
      recurringExpense: populated,
    });
  } catch (error: any) {
    console.error('Error updating recurring expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteRecurringExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const recurringExpense = await RecurringExpense.findById(req.params.id);

    if (!recurringExpense) {
      res.status(404).json({ message: 'Recurring expense not found' });
      return;
    }

    // Only owner or admin can delete
    if (recurringExpense.ownerId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only expense owner can delete' });
      return;
    }

    await RecurringExpense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Recurring expense deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting recurring expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const processRecurringExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // This endpoint can be called by a cron job or manually
    const now = new Date();

    // Find all active recurring expenses that are due
    const dueExpenses = await RecurringExpense.find({
      isActive: true,
      nextOccurrence: { $lte: now },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
    })
      .populate('householdId');

    const created: any[] = [];
    const errors: any[] = [];

    for (const recurring of dueExpenses) {
      try {
        // Calculate split details if it's a household expense
        let splitDetails = recurring.splitDetails;
        if (recurring.householdId && recurring.splitMethod !== 'none') {
          const household = await Household.findById(recurring.householdId);
          if (household) {
            splitDetails = calculateSplitDetails(
              {
                amount: recurring.amount,
                splitMethod: recurring.splitMethod,
                splitDetails: recurring.splitDetails,
                paidBy: recurring.paidBy,
              },
              household
            );
          }
        }

        // Create the actual expense
        const expense = await Expense.create({
          amount: recurring.amount,
          description: `${recurring.description} (Recurring)`,
          category: recurring.category,
          date: new Date(),
          ownerId: recurring.ownerId,
          householdId: recurring.householdId || undefined,
          currency: recurring.currency,
          paidBy: recurring.paidBy,
          splitMethod: recurring.splitMethod,
          splitDetails,
        });

        created.push(expense._id);

        // Update next occurrence
        recurring.nextOccurrence = calculateNextOccurrence(
          recurring.nextOccurrence,
          recurring.frequency
        );
        await recurring.save();
      } catch (error: any) {
        errors.push({
          recurringExpenseId: recurring._id,
          error: error.message,
        });
      }
    }

    res.json({
      message: 'Recurring expenses processed',
      processed: dueExpenses.length,
      created: created.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error processing recurring expenses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

