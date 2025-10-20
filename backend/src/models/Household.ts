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
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
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

