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
  createdBy: string;
  budget?: {
    monthlyLimit: number;
    currency: string;
    contributions: Array<{
      userId: string;
      amount: number;
      date: Date;
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

