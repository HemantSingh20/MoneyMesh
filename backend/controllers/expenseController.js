import Expense from '../models/Expense.js';
import BudgetCategory from '../models/BudgetCategory.js';

// Helper to update category spent amount
const syncCategorySpent = async (userId, categoryName) => {
  try {
    const expenses = await Expense.find({ user: userId, category: categoryName });
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    await BudgetCategory.findOneAndUpdate(
      { user: userId, name: categoryName },
      { spent: totalSpent },
      { new: true }
    );
  } catch (error) {
    console.error(`Error syncing spent for ${categoryName}:`, error);
  }
};

// @desc    Get all personal expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a personal expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !description) {
      return res.status(400).json({ message: 'Amount, category, and description are required' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    // Find the category to ensure it exists
    let budgetCat = await BudgetCategory.findOne({ user: req.user._id, name: category });
    if (!budgetCat) {
      // If it doesn't exist, create it as a custom category with 0 budget
      budgetCat = await BudgetCategory.create({
        user: req.user._id,
        name: category,
        budget: 0,
        spent: 0
      });
    }

    // Create the expense
    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      description,
      date: date || Date.now(),
    });

    // Update the category's spent amount
    await syncCategorySpent(req.user._id, category);

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a personal expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const oldCategory = expense.category;

    if (amount !== undefined) {
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      expense.amount = amount;
    }

    if (category) {
      // Make sure new category exists
      let budgetCat = await BudgetCategory.findOne({ user: req.user._id, name: category });
      if (!budgetCat) {
        await BudgetCategory.create({
          user: req.user._id,
          name: category,
          budget: 0,
          spent: 0
        });
      }
      expense.category = category;
    }

    if (description) {
      expense.description = description;
    }

    if (date) {
      expense.date = date;
    }

    const updatedExpense = await expense.save();

    // Sync spent for old and new category if changed, otherwise just new category
    await syncCategorySpent(req.user._id, expense.category);
    if (category && oldCategory !== category) {
      await syncCategorySpent(req.user._id, oldCategory);
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a personal expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const category = expense.category;

    await Expense.deleteOne({ _id: req.params.id });

    // Sync the category spent
    await syncCategorySpent(req.user._id, category);

    res.json({ message: 'Expense removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export { getExpenses, createExpense, updateExpense, deleteExpense };
