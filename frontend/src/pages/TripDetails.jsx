import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, AuthContext } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Users,
  Plus,
  Trash2,
  DollarSign,
  Info,
  ArrowRight,
  Sparkles,
  Award,
  Wallet,
  Activity,
  Car,
  ShoppingBag,
  Hotel,
  Coffee,
  HelpCircle,
  Tag
} from 'lucide-react';

const TripDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'settlements', 'members'

  // Add Expense form state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Hotel');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState('');

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/trips/${id}`);
      setTrip(res.data.trip);
      setExpenses(res.data.expenses);
      setBalances(res.data.balances);
      setSettlements(res.data.settlements);
      
      // Default payer to current user if found in members
      if (res.data.trip && res.data.trip.members.length > 0) {
        const defaultPayer = res.data.trip.members.find(m => m._id === user?._id)?._id || res.data.trip.members[0]._id;
        setPaidBy(defaultPayer);
      }
    } catch (err) {
      console.error('Failed to load trip details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
    setDate(new Date().toISOString().split('T')[0]);
  }, [id, user]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || !category || !description || !paidBy) {
      alert('Please fill out all fields.');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a positive amount.');
      return;
    }

    try {
      await api.post(`/api/trips/${id}/expenses`, {
        amount: amt,
        category,
        description,
        paidBy,
        date: date || new Date().toISOString(),
      });
      setAmount('');
      setDescription('');
      setIsAddExpenseOpen(false);
      fetchTripDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add group expense.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/api/trips/${id}/expenses/${expenseId}`);
      fetchTripDetails();
    } catch (err) {
      alert('Failed to delete group expense.');
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case 'hotel':
        return Hotel;
      case 'food':
        return Coffee;
      case 'transport':
        return Car;
      case 'shopping':
        return ShoppingBag;
      case 'activities':
        return Activity;
      default:
        return Tag;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-6 text-center max-w-md mx-auto space-y-4">
        <h3 className="text-lg font-bold">Trip not found</h3>
        <p className="text-slate-500">The trip you are looking for does not exist or you do not have permission to view it.</p>
        <Link to="/trips" className="text-blue-500 hover:underline">Back to Trips</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back link & Header */}
      <div className="space-y-4">
        <Link
          to="/trips"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trips</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{trip.name}</h2>
            {trip.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {trip.description}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">Trip Code: <span className="font-mono font-semibold uppercase">{trip.tripId}</span></p>
          </div>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md glow-primary hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Group Expense</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all duration-200
            ${
              activeTab === 'expenses'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all duration-200
            ${
              activeTab === 'settlements'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          Balances & Settlements
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all duration-200
            ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          Members ({trip.members.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="py-16 border border-dashed rounded-2xl text-center space-y-3">
                <DollarSign className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                <h4 className="font-semibold text-slate-400">No expenses recorded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click 'Add Group Expense' above to enter hotel bills, travel costs, or restaurant bills.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {expenses.map((exp) => {
                  const Icon = getCategoryIcon(exp.category);
                  return (
                    <div
                      key={exp._id}
                      className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 border dark:border-slate-700/50 shadow-inner flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                            {exp.description}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                              {exp.category}
                            </span>
                            <span>Paid by: <span className="font-semibold text-slate-600 dark:text-slate-300">{exp.paidBy.name}</span></span>
                            <span>•</span>
                            <span>
                              {new Date(exp.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          ₹{exp.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Net Balances Table */}
            <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold">Group Net Balances</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Member</th>
                      <th className="pb-3 font-semibold text-right">Paid (₹)</th>
                      <th className="pb-3 font-semibold text-right">Share (₹)</th>
                      <th className="pb-3 font-semibold text-right">Net Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {balances.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                        <td className="py-4 font-semibold">{b.name}</td>
                        <td className="py-4 text-right">₹{b.paid.toFixed(2)}</td>
                        <td className="py-4 text-right">₹{b.share.toFixed(2)}</td>
                        <td
                          className={`py-4 text-right font-bold
                            ${b.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}
                          `}
                        >
                          {b.net >= 0 ? '+' : ''}₹{b.net.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Settlements Panel */}
            <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                <span>Optimized Settlements Summary</span>
              </h3>
              
              {settlements.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Award className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="font-semibold text-slate-800 dark:text-slate-200">All debts settled!</p>
                  <p className="text-xs">
                    Either there are no group expenses yet, or the shares sum up to perfect offsets.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settlements.map((s, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-blue-100 dark:hover:border-blue-950/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {s.from.name}
                          </p>
                          <span className="text-[10px] text-rose-500 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded">
                            Pays
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {s.to.name}
                          </p>
                          <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Receives
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">
                        ₹{s.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {trip.members.map((member) => (
              <div
                key={member._id}
                className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold shadow-inner">
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    member.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-white truncate">{member.name}</h4>
                  <p className="text-xs text-slate-400 truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-250">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Group Expense</h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <Trash2 className="w-5 h-5 text-slate-400 rotate-45" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition duration-200"
                >
                  <option value="Hotel" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">Hotel</option>
                  <option value="Food" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">Food</option>
                  <option value="Transport" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">Transport</option>
                  <option value="Shopping" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">Shopping</option>
                  <option value="Activities" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">Activities</option>
                  <option value="Other" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">Other</option>
                </select>
              </div>

              {/* Paid By */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Paid By
                </label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition duration-200"
                >
                  {trip.members.map((member) => (
                    <option key={member._id} value={member._id} className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Booking of hotel villa"
                  className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md focus:ring-2 focus:ring-blue-500"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
