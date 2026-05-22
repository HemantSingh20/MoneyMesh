import Trip from '../models/Trip.js';
import TripExpense from '../models/TripExpense.js';
import User from '../models/User.js';

// Helper to generate an 8-character unique Trip ID
const generateUniqueTripId = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await Trip.findOne({ tripId: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// Settlement engine algorithm helper
const calculateSettlements = (members, expenses) => {
  const balanceMap = {};
  
  members.forEach((member) => {
    balanceMap[member._id.toString()] = {
      _id: member._id,
      name: member.name,
      email: member.email,
      profileImage: member.profileImage || '',
      paid: 0,
      share: 0,
      net: 0,
    };
  });

  const memberCount = members.length;
  if (memberCount === 0) return { balances: [], settlements: [] };

  // Calculate total paid and total share
  expenses.forEach((exp) => {
    const payerId = exp.paidBy._id ? exp.paidBy._id.toString() : exp.paidBy.toString();
    if (balanceMap[payerId]) {
      balanceMap[payerId].paid += exp.amount;
    }
    
    // Equal split
    const sharePerMember = exp.amount / memberCount;
    members.forEach((member) => {
      const mId = member._id.toString();
      if (balanceMap[mId]) {
        balanceMap[mId].share += sharePerMember;
      }
    });
  });

  // Calculate net balances
  const balances = Object.values(balanceMap).map((b) => {
    b.net = b.paid - b.share;
    // Math rounding
    b.paid = Math.round(b.paid * 100) / 100;
    b.share = Math.round(b.share * 100) / 100;
    b.net = Math.round(b.net * 100) / 100;
    return b;
  });

  // Split into creditors and debtors
  const creditors = [];
  const debtors = [];

  balances.forEach((b) => {
    if (b.net > 0.01) {
      creditors.push({ ...b });
    } else if (b.net < -0.01) {
      debtors.push({ ...b });
    }
  });

  // Sort creditors descending, debtors ascending (most negative first)
  creditors.sort((a, b) => b.net - a.net);
  debtors.sort((a, b) => a.net - b.net);

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.net, Math.abs(debtor.net));
    if (amount > 0.01) {
      settlements.push({
        from: {
          _id: debtor._id,
          name: debtor.name,
          email: debtor.email,
        },
        to: {
          _id: creditor._id,
          name: creditor.name,
          email: creditor.email,
        },
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.net -= amount;
    debtor.net += amount;

    if (Math.abs(creditor.net) <= 0.01) i++;
    if (Math.abs(debtor.net) <= 0.01) j++;
  }

  return { balances, settlements };
};

// @desc    Create a new Trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Trip name is required' });
    }

    const tripId = await generateUniqueTripId();

    const trip = await Trip.create({
      name,
      description: description || '',
      tripId,
      creator: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join an existing Trip using Trip ID code
// @route   POST /api/trips/join
// @access  Private
const joinTrip = async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ message: 'Trip ID is required' });
    }

    const trip = await Trip.findOne({ tripId: tripId.toUpperCase().trim() });

    if (!trip) {
      return res.status(444).json({ message: 'Trip not found with this code' });
    }

    if (trip.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this trip' });
    }

    trip.members.push(req.user._id);
    await trip.save();

    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all trips current user belongs to
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ members: req.user._id })
      .populate('members', 'name email profileImage')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed trip: members, expenses, settlements
// @route   GET /api/trips/:id
// @access  Private
const getTripDetails = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('members', 'name email profileImage');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!trip.members.some((m) => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this trip' });
    }

    const expenses = await TripExpense.find({ trip: trip._id })
      .populate('paidBy', 'name email profileImage')
      .sort({ date: -1 });

    const { balances, settlements } = calculateSettlements(trip.members, expenses);

    res.json({
      trip,
      expenses,
      balances,
      settlements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a group expense to a trip
// @route   POST /api/trips/:id/expenses
// @access  Private
const addTripExpense = async (req, res) => {
  try {
    const { amount, category, description, paidBy, date } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!trip.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to post expenses to this trip' });
    }

    if (!amount || !category || !description || !paidBy) {
      return res.status(400).json({ message: 'Please provide amount, category, description and paidBy' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    // Verify paidBy is a member of the trip
    if (!trip.members.includes(paidBy)) {
      return res.status(400).json({ message: 'Payer must be a member of the trip' });
    }

    const expense = await TripExpense.create({
      trip: trip._id,
      amount,
      category,
      description,
      paidBy,
      date: date || Date.now(),
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a group expense from a trip
// @route   DELETE /api/trips/:id/expenses/:expenseId
// @access  Private
const deleteTripExpense = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!trip.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete expenses from this trip' });
    }

    const expense = await TripExpense.findOne({ _id: req.params.expenseId, trip: trip._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found in this trip' });
    }

    await TripExpense.deleteOne({ _id: req.params.expenseId });

    res.json({ message: 'Trip expense removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export {
  createTrip,
  joinTrip,
  getTrips,
  getTripDetails,
  addTripExpense,
  deleteTripExpense,
};
