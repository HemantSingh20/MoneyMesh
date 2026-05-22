import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import BudgetCategory from '../models/BudgetCategory.js';

// Helper to sync category spent amount by summing all expenses for this category
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

// @desc    Get public Razorpay Key ID
// @route   GET /api/payments/key
// @access  Private
const getRazorpayKey = async (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123' });
};

// @desc    Create a Razorpay order
// @route   POST /api/payments/order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const isDummyKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummykey');

    if (isDummyKey) {
      // Mock Order Response when no real keys are set
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
        status: 'created',
        notes: { mock: true }
      };
      return res.status(201).json(mockOrder);
    }

    // Initialize Razorpay Client with real credentials
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create payment order: ' + error.message });
  }
};

// @desc    Verify Razorpay payment signature and log payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, category } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !amount || !category) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const isDummyKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummykey');
    let verified = false;

    if (isDummyKey || razorpay_order_id.startsWith('order_mock_')) {
      console.log(`[PAYMENT] Verifying mock payment: ${razorpay_payment_id}`);
      verified = true;
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generatedSignature = hmac.digest('hex');
      
      if (generatedSignature === razorpay_signature) {
        verified = true;
      }
    }

    if (!verified) {
      return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
    }

    // Prevent duplicate entries
    const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment has already been processed' });
    }

    // Save transaction details in MongoDB
    const payment = await Payment.create({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature || 'mock_signature',
      amount,
      category,
      user: req.user._id,
    });

    // Make sure category exists in BudgetCategory
    let budgetCat = await BudgetCategory.findOne({ user: req.user._id, name: category });
    if (!budgetCat) {
      budgetCat = await BudgetCategory.create({
        user: req.user._id,
        name: category,
        budget: 0,
        spent: 0
      });
    }

    // Save as an Expense to register in general ledger / dashboard lists
    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      description: `Razorpay Payment - ${razorpay_payment_id}`,
      date: new Date(),
    });

    // Update category spent amount
    await syncCategorySpent(req.user._id, category);

    res.status(200).json({
      success: true,
      message: 'Payment verified and transaction recorded successfully',
      payment,
      expense
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ message: 'Failed to verify payment: ' + error.message });
  }
};

export { getRazorpayKey, createOrder, verifyPayment };
