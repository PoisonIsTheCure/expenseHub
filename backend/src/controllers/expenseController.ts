import { Response } from 'express';
import { Expense } from '../models/Expense';
import { Household } from '../models/Household';
import { AuthRequest } from '../types';
import { calculateSplitDetails } from '../services/calculationService';

// Normalize stored file URLs by stripping any leading "/uploads/" and
// ensuring a single leading "/" so the frontend can safely prefix with VITE_UPLOADS_URL
const normalizeFileUrl = (url: string): string => {
  if (!url) return url;
  const filename = url.replace(/^\/?uploads\//, '');
  return `${filename}`;
};

export const getAllExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get user's personal expenses
    const personalExpenses = await Expense.find({
      ownerId: userId,
      householdId: { $exists: false }
    })
      .populate('ownerId', 'name email')
      .populate('paidBy', 'name email')
      .sort({ date: -1 });

    // Get households where user is a member
    const households = await Household.find({
      members: userId
    });

    const householdIds = households.map(h => (h._id as any).toString());

    // Get household expenses where user is a member
    const householdExpenses = await Expense.find({
      householdId: { $in: householdIds }
    })
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .populate('paidBy', 'name email')
      .sort({ date: -1 });

    // Combine and sort all expenses
    const allExpenses = [...personalExpenses, ...householdExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({ expenses: allExpenses });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, description, category, date, householdId, currency, splitMethod, splitDetails, paidBy } = req.body;
    const userId = req.user?.id;

    console.log('Creating expense:', { amount, description, category, date, householdId, currency, splitMethod, userId });
    console.log('req.files:', req.files);
    console.log('req.body.attachments:', req.body.attachments);
    console.log('req.body.attachments:', req.body.attachments);

    // Validate required fields
    if (!amount || !description || !category) {
      console.log('Missing required fields:', { amount, description, category });
      res.status(400).json({ message: 'Amount, description, and category are required' });
      return;
    }

    if (!userId) {
      console.log('No user ID found in request');
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Validate household membership if householdId provided
    let household = null;
    if (householdId) {
      household = await Household.findById(householdId);
      if (!household) {
        console.log('Household not found:', householdId);
        res.status(404).json({ message: 'Household not found' });
        return;
      }
      if (!household.members.includes(userId)) {
        console.log('User not a member of household:', { userId, householdId, members: household.members });
        res.status(403).json({ message: 'Not a member of this household' });
        return;
      }
    }

    // Calculate split details if it's a household expense
    let calculatedSplitDetails = splitDetails || [];
    const expenseSplitMethod = splitMethod || (householdId ? 'equal' : 'none');
    
    if (householdId && household && expenseSplitMethod !== 'none') {
      calculatedSplitDetails = calculateSplitDetails(
        {
          amount: parseFloat(amount),
          splitMethod: expenseSplitMethod,
          splitDetails: splitDetails || [],
          paidBy: paidBy || userId,
        },
        household
      );
    }

    // Handle attachments from both uploaded files and body data
    let attachments = (req.body.attachments || []) as Array<any>;

    // If files were uploaded via multer, add them to attachments
    if (req.files && (req.files as any[]).length > 0) {
      const uploadedFiles = (req.files as any[]).map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/${file.filename}`, // Store relative path
      }));
      attachments = [...attachments, ...uploadedFiles];
    }

    const normalizedAttachments = attachments.map((att: any) => ({
      ...att,
      url: normalizeFileUrl(att.url),
    }));

    const expenseData = {
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      date: date ? new Date(date) : new Date(),
      ownerId: userId,
      householdId: householdId || undefined,
      currency: currency || 'EUR',
      paidBy: paidBy || userId,
      splitMethod: expenseSplitMethod,
      splitDetails: calculatedSplitDetails,
      attachments: normalizedAttachments,
    };

    console.log('Creating expense with data:', expenseData);

    const expense = await Expense.create(expenseData);
    console.log('Expense created successfully:', expense._id);

    const populatedExpense = await Expense.findById(expense._id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .populate('paidBy', 'name email');

    console.log('Expense populated successfully:', populatedExpense);

    res.status(201).json({
      message: 'Expense created successfully',
      expense: populatedExpense,
    });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const expense = await Expense.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .populate('paidBy', 'name email');

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
    const { amount, description, category, date, householdId, currency, splitMethod, splitDetails, paidBy } = req.body;

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

    // Validate household membership if householdId provided
    let household = null;
    if (householdId) {
      household = await Household.findById(householdId);
      if (!household) {
        res.status(404).json({ message: 'Household not found' });
        return;
      }
      if (!household.members.includes(userId!)) {
        res.status(403).json({ message: 'Not a member of this household' });
        return;
      }
    }

    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (description) expense.description = description.trim();
    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (householdId !== undefined) expense.householdId = householdId || undefined;
    if (currency) expense.currency = currency;
    if (paidBy) expense.paidBy = paidBy;
    if (splitMethod) expense.splitMethod = splitMethod;

    // Recalculate split details if split method or amount changed
    if ((splitMethod || amount) && expense.householdId) {
      const targetHousehold = household || await Household.findById(expense.householdId);
      if (targetHousehold && expense.splitMethod !== 'none') {
        expense.splitDetails = calculateSplitDetails(
          {
            amount: expense.amount,
            splitMethod: expense.splitMethod,
            splitDetails: splitDetails || expense.splitDetails,
            paidBy: expense.paidBy,
          },
          targetHousehold
        );
      }
    } else if (splitDetails) {
      expense.splitDetails = splitDetails;
    }

    // Normalize attachments if provided in body
    if (req.body.attachments) {
      const normalized = (req.body.attachments as Array<any>).map((att: any) => ({
        ...att,
        url: normalizeFileUrl(att.url),
      }));
      expense.attachments = normalized;
    }

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('ownerId', 'name email')
      .populate('householdId', 'name')
      .populate('paidBy', 'name email');

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
      .populate('paidBy', 'name email')
      .sort({ date: -1 });

    res.json({ expenses });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

