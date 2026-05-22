import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, api } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import CategoryProgress from '../components/CategoryProgress';
import AddExpenseModal from '../components/AddExpenseModal';
import OverspendingModal from '../components/OverspendingModal';
import PayNowModal from '../components/PayNowModal';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  CheckCircle,
  Plus,
  Trash2,
  AlertTriangle,
  History,
  Info,
  CreditCard
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isOverspendingOpen, setIsOverspendingOpen] = useState(false);
  const [isPayNowOpen, setIsPayNowOpen] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  
  // Pending actions
  const [pendingExpense, setPendingExpense] = useState(null);
  const [pendingDeficit, setPendingDeficit] = useState(0);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, expRes] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/expenses')
      ]);
      setCategories(catRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats
  const totalIncome = user?.income || 0;
  
  // Sum spent across all categories
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Get savings category budget
  const savingsCategory = categories.find(c => c.name.toLowerCase() === 'savings');
  const totalSavings = savingsCategory ? savingsCategory.spent : 0;

  // Remaining Balance = Monthly Income - Total Spent
  const remainingBalance = totalIncome - totalSpent;

  // Handles adding/editing personal expense
  const handleExpenseSubmit = async (expenseData) => {
    // 1. Locate the budget category for this expense
    const targetCategory = categories.find(
      (cat) => cat.name.toLowerCase() === expenseData.category.toLowerCase()
    );

    if (targetCategory && targetCategory.budget > 0) {
      // Calculate potential spent if this expense is added
      const potentialSpent = targetCategory.spent + expenseData.amount;
      if (potentialSpent > targetCategory.budget) {
        // Exceeded budget! Calculate deficit
        const deficit = potentialSpent - targetCategory.budget;
        
        // Save the details and open the OverspendingModal
        setPendingExpense(expenseData);
        setPendingDeficit(deficit);
        setIsAddExpenseOpen(false);
        setIsOverspendingOpen(true);
        return;
      }
    }

    // Otherwise, create directly
    await submitNewExpense(expenseData);
  };

  // Triggers API call to record the expense
  const submitNewExpense = async (expenseData) => {
    try {
      await api.post('/api/expenses', expenseData);
      setIsAddExpenseOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense.');
    }
  };

  const handlePaymentSuccess = (msg) => {
    setPaymentSuccessMsg(msg);
    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setPaymentSuccessMsg('');
    }, 6000);
    fetchData();
  };

  // Handles resolving the budget overspending choice
  const handleOverspendingResolution = async (resolution) => {
    try {
      const { option, sourceCategoryId, savingsCategoryId } = resolution;
      
      const targetCategory = categories.find(
        (cat) => cat.name.toLowerCase() === pendingExpense.category.toLowerCase()
      );

      if (option === 'savings' && savingsCategoryId) {
        // Transfer budget from Savings to Target Category
        await api.post('/api/categories/transfer', {
          fromCategoryId: savingsCategoryId,
          toCategoryId: targetCategory._id,
          amount: pendingDeficit,
        });
      } else if (option === 'transfer' && sourceCategoryId) {
        // Transfer budget from selected source to Target Category
        await api.post('/api/categories/transfer', {
          fromCategoryId: sourceCategoryId,
          toCategoryId: targetCategory._id,
          amount: pendingDeficit,
        });
      }

      // Now proceed to save the expense
      await submitNewExpense(pendingExpense);
      setIsOverspendingOpen(false);
      setPendingExpense(null);
      setPendingDeficit(0);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to transfer budget and save expense.');
    }
  };

  // Handle delete expense
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/api/expenses/${expenseId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete expense.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Payment Success Alert */}
      {paymentSuccessMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="text-sm font-semibold">{paymentSuccessMsg}</div>
        </div>
      )}

      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor your monthly savings, limits, and daily transactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPayNowOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md transition-all duration-200"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Now</span>
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md glow-primary hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Income"
          value={`₹${totalIncome.toLocaleString('en-IN')}`}
          icon={Wallet}
          color="blue"
          subtitle="Monthly Income Limit"
        />
        <DashboardCard
          title="Total Expenses"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="rose"
          subtitle="Cumulative Spent"
        />
        <DashboardCard
          title="Savings"
          value={`₹${totalSavings.toLocaleString('en-IN')}`}
          icon={PiggyBank}
          color="green"
          subtitle="Deducted to Savings"
        />
        <DashboardCard
          title="Remaining Budget"
          value={`₹${remainingBalance.toLocaleString('en-IN')}`}
          icon={CheckCircle}
          color={remainingBalance >= 0 ? 'purple' : 'rose'}
          subtitle={remainingBalance >= 0 ? 'Surplus Balance' : 'Budget Exceeded!'}
        />
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Categories and Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Category Budgets</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Allocated limits vs actual spending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <CategoryProgress key={cat._id} category={cat} />
            ))}
          </div>
        </div>

        {/* Right side: Recent Transactions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              <span>Recent Transactions</span>
            </h3>
          </div>

          <div className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3 max-h-[480px] overflow-y-auto">
            {expenses.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Info className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">No expenses recorded yet</p>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                  Click 'Add Expense' above to start tracking your purchases.
                </p>
              </div>
            ) : (
              expenses.map((exp) => (
                <div
                  key={exp._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
                      {exp.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                        {exp.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(exp.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      ₹{exp.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSubmit={handleExpenseSubmit}
        categories={categories}
      />

      {/* Overspending Modal */}
      <OverspendingModal
        isOpen={isOverspendingOpen}
        onClose={() => {
          setIsOverspendingOpen(false);
          setPendingExpense(null);
          setPendingDeficit(0);
        }}
        deficit={pendingDeficit}
        categories={categories}
        targetCategoryName={pendingExpense?.category || ''}
        onResolve={handleOverspendingResolution}
      />

      {/* Pay Now Modal */}
      <PayNowModal
        isOpen={isPayNowOpen}
        onClose={() => setIsPayNowOpen(false)}
        categories={categories}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Dashboard;
