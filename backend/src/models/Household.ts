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
  },
  {
    timestamps: true,
  }
);

export const Household = mongoose.model<IHousehold>('Household', householdSchema);

