import mongoose, { Schema } from 'mongoose';
import { ISettlement } from '../types';

const settlementSchema = new Schema<ISettlement>(
  {
    householdId: {
      type: String,
      ref: 'Household',
      required: [true, 'Household ID is required'],
    },
    fromUserId: {
      type: String,
      ref: 'User',
      required: [true, 'From user ID is required'],
    },
    toUserId: {
      type: String,
      ref: 'User',
      required: [true, 'To user ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    settlementDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    proofOfPayment: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
settlementSchema.index({ householdId: 1, createdAt: -1 });
settlementSchema.index({ fromUserId: 1 });
settlementSchema.index({ toUserId: 1 });

export const Settlement = mongoose.model<ISettlement>('Settlement', settlementSchema);

