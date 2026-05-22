import mongoose from 'mongoose';

const budgetCategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for remaining balance
budgetCategorySchema.virtual('remainingBalance').get(function () {
  return this.budget - this.spent;
});

const BudgetCategory = mongoose.model('BudgetCategory', budgetCategorySchema);
export default BudgetCategory;
