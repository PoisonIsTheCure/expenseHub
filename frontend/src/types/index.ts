export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  householdId?: string;
}

export interface Household {
  _id: string;
  name: string;
  members: User[];
  createdBy: User;
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

