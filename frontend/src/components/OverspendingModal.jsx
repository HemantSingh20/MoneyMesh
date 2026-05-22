import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ArrowRightLeft, Sparkles, AlertCircle } from 'lucide-react';

const OverspendingModal = ({
  isOpen,
  onClose,
  deficit,
  categories,
  targetCategoryName,
  onResolve,
}) => {
  const [selectedOption, setSelectedOption] = useState(''); // 'savings', 'transfer', 'allow'
  const [transferSourceId, setTransferSourceId] = useState('');

  if (!isOpen) return null;

  // Find savings category details
  const savingsCategory = categories.find((cat) => cat.name.toLowerCase() === 'savings');
  const hasSavings = savingsCategory && savingsCategory.remainingBalance >= deficit;

  // Eligible transfer categories (excluding target and savings if preferred, but let's just exclude target category)
  const transferCategories = categories.filter(
    (cat) => cat.name.toLowerCase() !== targetCategoryName.toLowerCase() && cat.remainingBalance > 0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption) return;

    if (selectedOption === 'transfer' && !transferSourceId) {
      alert('Please select a source category to transfer budget from.');
      return;
    }

    onResolve({
      option: selectedOption,
      sourceCategoryId: selectedOption === 'transfer' ? transferSourceId : null,
      savingsCategoryId: selectedOption === 'savings' ? savingsCategory?._id : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-250">
        {/* Warning Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 to-red-500/10 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-full bg-amber-500/20 text-amber-500 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">
              You exceeded your budget
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {targetCategoryName} is short by ₹{deficit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Form Options */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            How would you like to handle this overspending?
          </p>

          <div className="space-y-3">
            {/* Option 1: Deduct from Savings */}
            <label
              className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200
                ${
                  selectedOption === 'savings'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }
                ${!hasSavings ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="overspend_option"
                value="savings"
                disabled={!hasSavings}
                checked={selectedOption === 'savings'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1 text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Deduct from Savings</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transfer ₹{deficit.toFixed(2)} from your Savings budget.
                  {savingsCategory ? (
                    <span className="block mt-1 font-medium text-slate-400">
                      Savings balance: ₹{savingsCategory.remainingBalance.toFixed(2)}
                    </span>
                  ) : (
                    <span className="block mt-1 font-medium text-rose-500">
                      No Savings category found.
                    </span>
                  )}
                </p>
              </div>
            </label>

            {/* Option 2: Transfer budget from another category */}
            <label
              className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200
                ${
                  selectedOption === 'transfer'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }
                ${transferCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="overspend_option"
                value="transfer"
                disabled={transferCategories.length === 0}
                checked={selectedOption === 'transfer'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1 text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                  <span>Transfer from another category</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deduct ₹{deficit.toFixed(2)} from another category's remaining budget.
                </p>

                {/* Sub-selector for Transfer */}
                {selectedOption === 'transfer' && (
                  <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                    <select
                      value={transferSourceId}
                      onChange={(e) => setTransferSourceId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    >
                      <option value="" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">-- Select Category --</option>
                      {transferCategories.map((cat) => (
                        <option key={cat._id} value={cat._id} className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900">
                          {cat.name} (Available: ₹{cat.remainingBalance.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </label>

            {/* Option 3: Allow Negative Balance */}
            <label
              className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200
                ${
                  selectedOption === 'allow'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }
              `}
            >
              <input
                type="radio"
                name="overspend_option"
                value="allow"
                checked={selectedOption === 'allow'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1 text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  <span>Allow Negative Balance</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record the expense anyway. The balance for {targetCategoryName} will go negative.
                </p>
              </div>
            </label>
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
              disabled={!selectedOption}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OverspendingModal;
