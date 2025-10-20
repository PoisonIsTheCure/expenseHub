import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  householdId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IHousehold extends Document {
  name: string;
  members: string[];
  createdBy: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

