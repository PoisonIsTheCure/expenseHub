export interface User {
  id: string;
  _id?: string; // Add _id for compatibility with backend
  name: string;
  email: string;
  role: 'admin' | 'user';
  householdId?: string;
  personalBudget?: {
    monthlyLimit: number;
    currency: string;
    resetDate: string;
  };
}

export interface Household {
  _id: string;
  name: string;
  members: User[];
  memberRoles?: Array<{
    userId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  }>;
  createdBy: User;
  defaultSplitMethod?: 'equal' | 'percentage' | 'custom' | 'none';
  memberWeights?: Array<{
    userId: string;
    weight: number;
    percentage?: number;
  }>;
  budget?: {
    monthlyLimit: number;
    currency: string;
    contributions: Array<{
      userId: User;
      amount: number;
      date: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  ownerId: User;
  householdId?: Household;
  currency: string;
  paidBy?: User;
  splitMethod?: 'equal' | 'percentage' | 'custom' | 'none';
  splitDetails?: Array<{
    userId: string | User;
    amount?: number;
    percentage?: number;
  }>;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

export interface HouseholdState {
  households: Household[];
  currentHousehold: Household | null;
  loading: boolean;
  error: string | null;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface PersonalBudget {
  monthlyLimit: number;
  currency: string;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  resetDate: string;
  expenses: Expense[];
}

export interface HouseholdBudget {
  monthlyLimit: number;
  currency: string;
  totalSpent: number;
  totalContributions: number;
  remaining: number;
  percentageUsed: number;
  contributions: Array<{
    userId: User;
    amount: number;
    date: string;
  }>;
  expenses: Expense[];
}

export interface BudgetState {
  personalBudget: PersonalBudget | null;
  householdBudgets: { [householdId: string]: HouseholdBudget };
  loading: boolean;
  error: string | null;
}

// Import from centralized config
import { CURRENCY } from '../config/currency';

// Legacy compatibility - single currency array
export const CURRENCIES = [CURRENCY] as const;

export type Currency = typeof CURRENCIES[number];

// Settlement types
export interface Settlement {
  _id: string;
  householdId: string | Household;
  fromUserId: User;
  toUserId: User;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  settlementDate?: string;
  notes?: string;
  proofOfPayment?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MemberBalance {
  userId: string;
  name: string;
  email: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

export interface DebtRelationship {
  fromUser: {
    id: string;
    name: string;
    email: string;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
}

export interface BalanceData {
  householdId: string;
  householdName: string;
  balances: MemberBalance[];
  debts: DebtRelationship[];
  currency: string;
}

// Recurring Expense types
export interface RecurringExpense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  ownerId: User;
  householdId?: Household;
  currency: string;
  isActive: boolean;
  splitMethod: 'equal' | 'percentage' | 'custom' | 'none';
  splitDetails: Array<{
    userId: string | User;
    amount?: number;
    percentage?: number;
  }>;
  paidBy?: User;
  reminderDays: number;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface PersonalAnalytics {
  totalSpent: number;
  totalExpenses: number;
  avgExpense: number;
  byCategory: { [key: string]: number };
  byMonth: { [key: string]: number };
  topCategories: CategoryData[];
}

export interface MemberSpending {
  userId: string;
  name: string;
  total: number;
  count: number;
  percentage: number;
}

export interface HouseholdAnalytics {
  household: {
    _id: string;
    name: string;
    memberCount: number;
  };
  totalSpent: number;
  totalExpenses: number;
  avgExpense: number;
  byCategory: { [key: string]: number };
  byMonth: { [key: string]: number };
  byMember: { [key: string]: { name: string; total: number; count: number } };
  topCategories: CategoryData[];
  topSpenders: MemberSpending[];
  splitMethodStats: { [key: string]: number };
}

export interface MonthComparison {
  currentMonth: {
    total: number;
    count: number;
    byCategory: { [key: string]: number };
  };
  lastMonth: {
    total: number;
    count: number;
    byCategory: { [key: string]: number };
  };
  comparison: {
    difference: number;
    percentageChange: number;
    trend: 'increase' | 'decrease' | 'stable';
  };
}

// State types
export interface SettlementState {
  settlements: Settlement[];
  balances: BalanceData | null;
  loading: boolean;
  error: string | null;
}

export interface RecurringExpenseState {
  recurringExpenses: RecurringExpense[];
  loading: boolean;
  error: string | null;
}

export interface AnalyticsState {
  personalAnalytics: PersonalAnalytics | null;
  householdAnalytics: { [householdId: string]: HouseholdAnalytics };
  monthComparison: MonthComparison | null;
  loading: boolean;
  error: string | null;
}

