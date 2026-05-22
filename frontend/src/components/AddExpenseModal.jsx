import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, DollarSign, FileText } from 'lucide-react';

const AddExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  expenseToEdit = null, // If editing
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setDescription(expenseToEdit.description);
      setDate(expenseToEdit.date ? new Date(expenseToEdit.date).toISOString().split('T')[0] : '');
      
      const isStandard = categories.some(
        (cat) => cat.name.toLowerCase() === expenseToEdit.category.toLowerCase()
      );
      if (isStandard) {
        setCategory(expenseToEdit.category);
        setIsCustomCategory(false);
      } else {
        setCategory(expenseToEdit.category);
        setIsCustomCategory(true);
      }
    } else {
      setAmount('');
      const defaultCategory = categories.length > 0 ? categories[0].name : 'Food';
      setCategory(defaultCategory);
      setIsCustomCategory(false);
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [expenseToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category || !description) {
      alert('Please fill out all fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Amount must be a positive number.');
      return;
    }

    onSubmit({
      amount: parsedAmount,
      category,
      description,
      date: date || new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {expenseToEdit ? 'Edit Personal Expense' : 'Add Personal Expense'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span className="font-semibold text-sm">₹</span>
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Category
            </label>
            <select
              value={isCustomCategory ? '__custom__' : category}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustomCategory(true);
                  setCategory('');
                } else {
                  setIsCustomCategory(false);
                  setCategory(e.target.value);
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition duration-200"
            >
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name} className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">
                  {cat.name}
                </option>
              ))}
              <option value="__custom__" className="text-blue-500 dark:text-blue-400 font-semibold bg-white dark:bg-slate-900">
                + Write Custom Category...
              </option>
            </select>
          </div>

          {/* Custom Category Input */}
          {isCustomCategory && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Custom Category Name
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Health, Subscriptions"
                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition duration-200"
                required
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Description
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FileText className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Weekly groceries"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Date
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md focus:ring-2 focus:ring-blue-500"
            >
              {expenseToEdit ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
