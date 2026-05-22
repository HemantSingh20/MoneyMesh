import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, api } from '../context/AuthContext';
import { Wallet, ArrowRightLeft, Plus, Check, Save } from 'lucide-react';

const BudgetSettings = () => {
  const { user, updateIncome } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [incomeInput, setIncomeInput] = useState('');
  
  // Custom category
  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('');

  // Transfer budget
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Editable budgets
  const [editingBudgets, setEditingBudgets] = useState({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (user) {
      setIncomeInput(user.income.toString());
    }
  }, [user]);

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    if (!incomeInput || isNaN(incomeInput) || parseFloat(incomeInput) < 0) {
      alert('Please enter a valid monthly income.');
      return;
    }
    const res = await updateIncome(parseFloat(incomeInput));
    if (res.success) {
      alert('Income updated successfully!');
    } else {
      alert(res.error);
    }
  };

  const handleBudgetChange = (catId, val) => {
    setEditingBudgets((prev) => ({
      ...prev,
      [catId]: val,
    }));
  };

  const handleBudgetSave = async (catId) => {
    const budgetVal = editingBudgets[catId];
    if (budgetVal === undefined || isNaN(budgetVal) || parseFloat(budgetVal) < 0) {
      alert('Please enter a valid budget amount.');
      return;
    }

    try {
      await api.put(`/api/categories/${catId}`, { budget: parseFloat(budgetVal) });
      // Remove from editing state
      setEditingBudgets((prev) => {
        const copy = { ...prev };
        delete copy[catId];
        return copy;
      });
      fetchCategories();
      alert('Budget updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category budget.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) {
      alert('Please enter a category name.');
      return;
    }

    try {
      const budget = parseFloat(newCatBudget) || 0;
      await api.post('/api/categories', { name: newCatName, budget });
      setNewCatName('');
      setNewCatBudget('');
      fetchCategories();
      alert('Category created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferFrom || !transferTo || !transferAmount) {
      alert('Please select source, destination, and amount.');
      return;
    }

    if (transferFrom === transferTo) {
      alert('Source and destination categories must be different.');
      return;
    }

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a positive transfer amount.');
      return;
    }

    try {
      await api.post('/api/categories/transfer', {
        fromCategoryId: transferFrom,
        toCategoryId: transferTo,
        amount: amt,
      });
      setTransferAmount('');
      fetchCategories();
      alert('Budget transferred successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to transfer budget.');
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Budgets & Categories</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your monthly income, set individual category limits, or transfer funds.
        </p>
      </div>

      {/* Grid: Income Configuration & Manual Transfer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Settings */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            <span>Monthly Income Settings</span>
          </h3>
          <form onSubmit={handleIncomeSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
            >
              Save Income
            </button>
          </form>
        </div>

        {/* Manual Budget Transfer */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-purple-500" />
            <span>Transfer Category Budget</span>
          </h3>
          <form onSubmit={handleTransfer} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  From Category
                </label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 dark:text-white transition"
                >
                  <option value="" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">-- Select --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">
                      {cat.name} (₹{cat.remainingBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  To Category
                </label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 dark:text-white transition"
                >
                  <option value="" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">-- Select --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Transfer Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition"
            >
              Transfer Funds
            </button>
          </form>
        </div>
      </div>

      {/* Grid: Category Budgets Table & Create Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table/List of Categories */}
        <div className="lg:col-span-2 p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold">Category Limit Allocations</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Category Name</th>
                  <th className="pb-3 font-semibold">Spent (₹)</th>
                  <th className="pb-3 font-semibold">Allocated Limit (₹)</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                    <td className="py-4 font-semibold">{cat.name}</td>
                    <td className="py-4 text-slate-500">₹{cat.spent.toFixed(2)}</td>
                    <td className="py-4">
                      <input
                        type="number"
                        value={
                          editingBudgets[cat._id] !== undefined
                            ? editingBudgets[cat._id]
                            : cat.budget
                        }
                        onChange={(e) => handleBudgetChange(cat._id, e.target.value)}
                        className="w-28 px-3 py-1 rounded-lg border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </td>
                    <td className="py-4 text-right">
                      {editingBudgets[cat._id] !== undefined && (
                        <button
                          onClick={() => handleBudgetSave(cat._id)}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 hover:bg-blue-100 transition shadow-sm"
                          title="Save budget"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Category Card */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4 h-fit">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            <span>Create Custom Category</span>
          </h3>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Category Name
              </label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Health"
                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Initial Budget (Optional)
              </label>
              <input
                type="number"
                value={newCatBudget}
                onChange={(e) => setNewCatBudget(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
            >
              Create Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetSettings;
