import BudgetCategory from '../models/BudgetCategory.js';

// @desc    Get all budget categories for authenticated user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await BudgetCategory.find({ user: req.user._id });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new custom budget category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, budget } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const exists = await BudgetCategory.findOne({ user: req.user._id, name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await BudgetCategory.create({
      user: req.user._id,
      name,
      budget: budget || 0,
      spent: 0,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update budget category amount
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { budget, name } = req.body;
    const category = await BudgetCategory.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (budget !== undefined) {
      if (isNaN(budget) || budget < 0) {
        return res.status(400).json({ message: 'Budget must be a non-negative number' });
      }
      category.budget = budget;
    }

    if (name) {
      category.name = name;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a budget category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await BudgetCategory.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // We can delete it. In a production app we might check if there are expenses, and if so, prevent deletion or reassign them.
    // For simplicity, let's delete it.
    await BudgetCategory.deleteOne({ _id: req.params.id });
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Transfer budget from one category to another
// @route   POST /api/categories/transfer
// @access  Private
const transferBudget = async (req, res) => {
  try {
    const { fromCategoryId, toCategoryId, amount } = req.body;

    if (!fromCategoryId || !toCategoryId || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer details' });
    }

    const fromCategory = await BudgetCategory.findOne({ _id: fromCategoryId, user: req.user._id });
    const toCategory = await BudgetCategory.findOne({ _id: toCategoryId, user: req.user._id });

    if (!fromCategory || !toCategory) {
      return res.status(404).json({ message: 'One or both categories not found' });
    }

    if (fromCategory.budget < amount) {
      return res.status(400).json({ message: `Insufficient budget in ${fromCategory.name} to transfer` });
    }

    fromCategory.budget -= amount;
    toCategory.budget += amount;

    await fromCategory.save();
    await toCategory.save();

    res.json({
      message: 'Budget transferred successfully',
      fromCategory,
      toCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export { getCategories, createCategory, updateCategory, deleteCategory, transferBudget };
