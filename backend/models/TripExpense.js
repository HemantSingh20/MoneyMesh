import mongoose from 'mongoose';

const tripExpenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Hotel', 'Food', 'Transport', 'Shopping', 'Activities', 'Other'],
    },
    description: {
      type: String,
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TripExpense = mongoose.model('TripExpense', tripExpenseSchema);
export default TripExpense;
