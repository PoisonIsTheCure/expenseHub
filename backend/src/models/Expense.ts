import mongoose, { Schema } from 'mongoose';
import { IExpense } from '../types';

const expenseSchema = new Schema<IExpense>(
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
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
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
      enum: ['EUR'],
    },
    paidBy: {
      type: String,
      ref: 'User',
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
        amount: {
          type: Number,
        },
        percentage: {
          type: Number,
        },
      },
    ],
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        mimetype: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
expenseSchema.index({ ownerId: 1, date: -1 });
expenseSchema.index({ householdId: 1, date: -1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);

