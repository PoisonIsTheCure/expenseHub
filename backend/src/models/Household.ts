import mongoose, { Schema } from 'mongoose';
import { IHousehold } from '../types';

const householdSchema = new Schema<IHousehold>(
  {
    name: {
      type: String,
      required: [true, 'Household name is required'],
      trim: true,
    },
    members: [
      {
        type: String,
        ref: 'User',
      },
    ],
    memberRoles: [
      {
        userId: {
          type: String,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'viewer'],
          default: 'member',
        },
      },
    ],
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    defaultSplitMethod: {
      type: String,
      enum: ['equal', 'percentage', 'custom', 'none'],
      default: 'equal',
    },
    memberWeights: [
      {
        userId: {
          type: String,
          ref: 'User',
        },
        weight: {
          type: Number,
          default: 1,
          min: 0,
        },
        percentage: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    budget: {
      monthlyLimit: {
        type: Number,
        min: [0, 'Monthly limit must be positive'],
      },
      currency: {
        type: String,
        default: 'EUR',
        enum: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
      },
      contributions: [
        {
          userId: {
            type: String,
            ref: 'User',
            required: true,
          },
          amount: {
            type: Number,
            required: true,
            min: [0, 'Contribution amount must be positive'],
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const Household = mongoose.model<IHousehold>('Household', householdSchema);

