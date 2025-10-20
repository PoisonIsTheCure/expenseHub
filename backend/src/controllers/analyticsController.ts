import { Response } from 'express';
import { Expense } from '../models/Expense';
import { Household } from '../models/Household';
import { User } from '../models/User';
import { AuthRequest } from '../types';

export const getPersonalAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate as string);
    }

    const query: any = {
      ownerId: userId,
      householdId: { $exists: false },
    };

    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }

    const expenses = await Expense.find(query);

    // Calculate total spending
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Group by category
    const byCategory: { [key: string]: number } = {};
    expenses.forEach((exp) => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });

    // Group by month
    const byMonth: { [key: string]: number } = {};
    expenses.forEach((exp) => {
      const month = new Date(exp.date).toISOString().slice(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + exp.amount;
    });

    // Calculate average
    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

    // Find top categories
    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpent) * 100,
      }));

    res.json({
      totalSpent,
      totalExpenses: expenses.length,
      avgExpense,
      byCategory,
      byMonth,
      topCategories,
    });
  } catch (error: any) {
    console.error('Error fetching personal analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHouseholdAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { householdId } = req.params;
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    // Verify user is a member of the household
    const household = await Household.findById(householdId).populate('members', 'name email');
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    if (!household.members.some((m: any) => m._id.toString() === userId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate as string);
    }

    const query: any = { householdId };
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }

    const expenses = await Expense.find(query).populate('ownerId', 'name email');

    // Calculate total spending
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Group by category
    const byCategory: { [key: string]: number } = {};
    expenses.forEach((exp) => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });

    // Group by member (who added the expense)
    const byMember: { [key: string]: { name: string; total: number; count: number } } = {};
    expenses.forEach((exp) => {
      const ownerId = (exp.ownerId as any)._id.toString();
      const ownerName = (exp.ownerId as any).name;
      
      if (!byMember[ownerId]) {
        byMember[ownerId] = { name: ownerName, total: 0, count: 0 };
      }
      byMember[ownerId].total += exp.amount;
      byMember[ownerId].count += 1;
    });

    // Group by month
    const byMonth: { [key: string]: number } = {};
    expenses.forEach((exp) => {
      const month = new Date(exp.date).toISOString().slice(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + exp.amount;
    });

    // Calculate average
    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

    // Find top categories
    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }));

    // Top spenders
    const topSpenders = Object.entries(byMember)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5)
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        total: data.total,
        count: data.count,
        percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
      }));

    // Split method distribution
    const splitMethodStats: { [key: string]: number } = {};
    expenses.forEach((exp) => {
      const method = exp.splitMethod || 'equal';
      splitMethodStats[method] = (splitMethodStats[method] || 0) + 1;
    });

    res.json({
      household: {
        _id: household._id,
        name: household.name,
        memberCount: household.members.length,
      },
      totalSpent,
      totalExpenses: expenses.length,
      avgExpense,
      byCategory,
      byMonth,
      byMember,
      topCategories,
      topSpenders,
      splitMethodStats,
    });
  } catch (error: any) {
    console.error('Error fetching household analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const compareMonths = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get current month and previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const baseQuery: any = householdId
      ? { householdId }
      : { ownerId: userId, householdId: { $exists: false } };

    // Current month expenses
    const currentMonthExpenses = await Expense.find({
      ...baseQuery,
      date: { $gte: currentMonthStart },
    });

    // Last month expenses
    const lastMonthExpenses = await Expense.find({
      ...baseQuery,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const difference = currentTotal - lastTotal;
    const percentageChange = lastTotal > 0 ? ((difference / lastTotal) * 100) : 0;

    // Category comparison
    const currentByCategory: { [key: string]: number } = {};
    currentMonthExpenses.forEach((exp) => {
      currentByCategory[exp.category] = (currentByCategory[exp.category] || 0) + exp.amount;
    });

    const lastByCategory: { [key: string]: number } = {};
    lastMonthExpenses.forEach((exp) => {
      lastByCategory[exp.category] = (lastByCategory[exp.category] || 0) + exp.amount;
    });

    res.json({
      currentMonth: {
        total: currentTotal,
        count: currentMonthExpenses.length,
        byCategory: currentByCategory,
      },
      lastMonth: {
        total: lastTotal,
        count: lastMonthExpenses.length,
        byCategory: lastByCategory,
      },
      comparison: {
        difference,
        percentageChange,
        trend: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'stable',
      },
    });
  } catch (error: any) {
    console.error('Error comparing months:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCategoryTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId, months = 6 } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const monthsBack = parseInt(months as string) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const baseQuery: any = householdId
      ? { householdId }
      : { ownerId: userId, householdId: { $exists: false } };

    const expenses = await Expense.find({
      ...baseQuery,
      date: { $gte: startDate },
    });

    // Group by month and category
    const trends: { [month: string]: { [category: string]: number } } = {};

    expenses.forEach((exp) => {
      const month = new Date(exp.date).toISOString().slice(0, 7);
      if (!trends[month]) {
        trends[month] = {};
      }
      trends[month][exp.category] = (trends[month][exp.category] || 0) + exp.amount;
    });

    res.json({ trends });
  } catch (error: any) {
    console.error('Error fetching category trends:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

