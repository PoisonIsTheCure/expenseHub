import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  householdId?: string;
  personalBudget?: {
    monthlyLimit: number;
    currency: string;
    resetDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IHousehold extends Document {
  name: string;
  members: string[];
  memberRoles: Array<{
    userId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  }>;
  createdBy: string;
  defaultSplitMethod: 'equal' | 'percentage' | 'custom' | 'none';
  memberWeights: Array<{
    userId: string;
    weight: number;
    percentage?: number;
  }>;
  budget?: {
    monthlyLimit: number;
    currency: string;
    contributions: Array<{
      userId: string;
      amount: number;
      date: Date;
      comment?: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpense extends Document {
  amount: number;
  description: string;
  category: string;
  date: Date;
  ownerId: string;
  householdId?: string;
  currency: string;
  paidBy?: string;
  splitMethod: 'equal' | 'percentage' | 'custom' | 'none';
  splitDetails: Array<{
    userId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  };
  files?: { [fieldname: string]: any[] } | any[] | undefined;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ISettlement extends Document {
  householdId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  settlementDate?: Date;
  notes?: string;
  proofOfPayment?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecurringExpense extends Document {
  amount: number;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  nextOccurrence: Date;
  ownerId: string;
  householdId?: string;
  currency: string;
  isActive: boolean;
  splitMethod: 'equal' | 'percentage' | 'custom' | 'none';
  splitDetails: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
  }>;
  paidBy?: string;
  reminderDays: number;
  createdAt: Date;
  updatedAt: Date;
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

