import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorMap = {
    blue: 'from-blue-500/10 to-indigo-500/5 text-blue-500 border-blue-500/20 dark:border-blue-500/10 glow-primary',
    purple: 'from-purple-500/10 to-pink-500/5 text-purple-500 border-purple-500/20 dark:border-purple-500/10 glow-secondary',
    green: 'from-emerald-500/10 to-teal-500/5 text-emerald-500 border-emerald-500/20 dark:border-emerald-500/10',
    amber: 'from-amber-500/10 to-yellow-500/5 text-amber-500 border-amber-500/20 dark:border-amber-500/10',
    rose: 'from-rose-500/10 to-red-500/5 text-rose-500 border-rose-500/20 dark:border-rose-500/10',
  };

  const bgGradient = colorMap[color] || colorMap['blue'];

  return (
    <div className={`p-6 rounded-2xl border bg-gradient-to-br bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-between ${bgGradient}`}>
      <div className="space-y-1 flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </p>
        <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white truncate">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/40 shadow-inner flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default DashboardCard;
