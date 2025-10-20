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
  createdBy: User;
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

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
] as const;

export type Currency = typeof CURRENCIES[number];

