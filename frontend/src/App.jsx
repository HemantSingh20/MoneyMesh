import React, { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import BudgetSettings from './pages/BudgetSettings';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-lightBg dark:bg-brand-darkBg">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// General Dashboard Layout (Sidebar + Top Navbar)
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Determine current page title dynamically based on window path
  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/') return 'Personal Finance Dashboard';
    if (path === '/analytics') return 'Spending Analytics';
    if (path === '/budgets') return 'Category Budgets';
    if (path.startsWith('/trips')) return 'Trip Expense Splitter';
    return 'MoneyMesh';
  };

  return (
    <div className="flex min-h-screen bg-brand-lightBg dark:bg-brand-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Contents Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleSidebar={toggleSidebar} title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/budgets" element={<BudgetSettings />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/trips/:id" element={<TripDetails />} />
              </Route>
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
