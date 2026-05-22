import User from '../models/User.js';
import BudgetCategory from '../models/BudgetCategory.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'moneymesh_super_secure_jwt_secret_token_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      profileImage: profileImage || '',
      income: 0,
    });

    if (user) {
      // Seed default categories
      const defaultCategories = [
        { name: 'Food', budget: 0, spent: 0 },
        { name: 'Rent', budget: 0, spent: 0 },
        { name: 'Travel', budget: 0, spent: 0 },
        { name: 'Shopping', budget: 0, spent: 0 },
        { name: 'Entertainment', budget: 0, spent: 0 },
        { name: 'EMI', budget: 0, spent: 0 },
        { name: 'Savings', budget: 0, spent: 0 },
      ];

      const categoryPromises = defaultCategories.map((cat) => {
        return BudgetCategory.create({
          user: user._id,
          name: cat.name,
          budget: cat.budget,
          spent: cat.spent,
        });
      });

      await Promise.all(categoryPromises);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        income: user.income,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        income: user.income,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        income: user.income,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user monthly income
// @route   PUT /api/auth/income
// @access  Private
const updateUserIncome = async (req, res) => {
  try {
    const { income } = req.body;

    if (income === undefined || isNaN(income) || income < 0) {
      return res.status(400).json({ message: 'Please provide a valid income amount' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.income = income;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        income: updatedUser.income,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password for a user
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, name, newPassword } = req.body;

    if (!email || !name || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, name, and new password' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Security check: Verify that the user's name matches (case-insensitive)
    if (user.name.toLowerCase() !== name.trim().toLowerCase()) {
      return res.status(400).json({ message: 'Security verification failed: Name does not match' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, loginUser, getUserProfile, updateUserIncome, resetPassword };
