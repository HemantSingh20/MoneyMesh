import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, PieChart as PieIcon, LineChart as LineIcon, Info } from 'lucide-react';

const Analytics = () => {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error('Failed to load analytics data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Theme configuration for charts
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#64748b', '#06b6d4'];

  // 1. Data for Category Distribution (Pie Chart)
  // Filter out categories with 0 spent to keep pie chart readable
  const pieData = categories
    .filter(cat => cat.spent > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.spent
    }));

  // 2. Data for Budget vs Spent (Bar Chart)
  const barData = categories.map(cat => ({
    name: cat.name,
    Budget: cat.budget,
    Spent: cat.spent
  }));

  // 3. Data for Spending Trend (Area Chart)
  // Group expenses by date (formatted as YYYY-MM-DD or Mon DD) and sort chronologically
  const getTrendData = () => {
    const dailyMap = {};
    expenses.forEach(exp => {
      const dateStr = new Date(exp.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + exp.amount;
    });

    // We convert map to sorted array (reverse chronologically from expenses which is descending, so we reverse it to ascending)
    return Object.keys(dailyMap)
      .map(date => ({
        Date: date,
        Amount: dailyMap[date]
      }))
      .reverse(); // ascending trend
  };

  const trendData = getTrendData();

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
        <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visualize your category breakdown, budget allocations, and spending history.
        </p>
      </div>

      {expenses.length === 0 ? (
        <div className="py-24 border rounded-2xl text-center space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <BarChart3 className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
          <h4 className="font-semibold text-slate-400">No data available for charts</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Once you log personal expenses in the Dashboard, they will be plotted here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Trend Area Chart */}
          <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="text-base font-bold flex items-center gap-2">
              <LineIcon className="w-5 h-5 text-blue-500" />
              <span>Spending Trend (Timeline)</span>
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="Date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#f8fafc',
                    }}
                  />
                  <Area type="monotone" dataKey="Amount" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-500" />
              <span>Category Distribution</span>
            </h3>
            {pieData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                All categories have 0 spending. Set some budgets and spend!
              </div>
            ) : (
              <div className="h-64 w-full text-xs flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#f8fafc',
                      }}
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Spent']}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Budget vs Spent Bar Chart */}
          <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <span>Budget vs Actual Spent</span>
            </h3>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Budget" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
