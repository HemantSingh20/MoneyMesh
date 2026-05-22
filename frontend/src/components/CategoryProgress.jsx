import React from 'react';
import { AlertCircle, TrendingUp, CheckCircle, HelpCircle } from 'lucide-react';

const CategoryProgress = ({ category, onEdit = null }) => {
  const { name, budget, spent, remainingBalance } = category;

  const getPercent = () => {
    if (!budget) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const percent = getPercent();
  const isOverspent = budget > 0 && spent > budget;
  const isUnbudgeted = !budget;

  // Determine theme colors based on state
  const getProgressColor = () => {
    if (isOverspent) return 'bg-rose-500 shadow-rose-500/20';
    if (percent > 85) return 'bg-amber-500 shadow-amber-500/20';
    return 'bg-emerald-500 shadow-emerald-500/20';
  };

  return (
    <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
      {/* Category Info */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            {name}
            {isOverspent && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-500">
                <AlertCircle className="w-3 h-3" /> Overspent
              </span>
            )}
            {isUnbudgeted && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400">
                <HelpCircle className="w-3 h-3" /> No Limit Set
              </span>
            )}
            {budget > 0 && !isOverspent && percent > 85 && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500">
                <TrendingUp className="w-3 h-3" /> Warning (85%+)
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Spent: ₹{spent.toFixed(2)} of ₹{budget.toFixed(2)}
          </p>
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(category)}
            className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition"
          >
            Adjust
          </button>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner flex">
          <div
            style={{ width: `${isUnbudgeted ? 0 : percent}%` }}
            className={`h-full rounded-full transition-all duration-500 shadow-md ${getProgressColor()}`}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-400">
            {isUnbudgeted ? '0%' : `${Math.round(percent)}% spent`}
          </span>
          <span
            className={`
              ${isOverspent ? 'text-rose-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}
            `}
          >
            {isOverspent ? (
              `Deficit: ₹${Math.abs(remainingBalance).toFixed(2)}`
            ) : (
              `Left: ₹${remainingBalance.toFixed(2)}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryProgress;
