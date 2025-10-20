import mongoose, { Schema } from 'mongoose';
import { IRecurringExpense } from '../types';

const recurringExpenseSchema = new Schema<IRecurringExpense>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
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
      ],
      default: 'Other',
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    nextOccurrence: {
      type: Date,
      required: [true, 'Next occurrence is required'],
    },
    ownerId: {
      type: String,
      ref: 'User',
      required: true,
    },
    householdId: {
      type: String,
      ref: 'Household',
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    splitMethod: {
      type: String,
      enum: ['equal', 'percentage', 'custom', 'none'],
      default: 'equal',
    },
    splitDetails: [
      {
        userId: {
          type: String,
          ref: 'User',
        },
        amount: Number,
        percentage: Number,
      },
    ],
    paidBy: {
      type: String,
      ref: 'User',
    },
    reminderDays: {
      type: Number,
      default: 3,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
recurringExpenseSchema.index({ ownerId: 1, isActive: 1 });
recurringExpenseSchema.index({ householdId: 1, isActive: 1 });
recurringExpenseSchema.index({ nextOccurrence: 1, isActive: 1 });

export const RecurringExpense = mongoose.model<IRecurringExpense>(
  'RecurringExpense',
  recurringExpenseSchema
);

