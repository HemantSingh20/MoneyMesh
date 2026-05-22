import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, Calendar } from 'lucide-react';

const Navbar = ({ toggleSidebar, title = "Dashboard" }) => {
  const { user } = useContext(AuthContext);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      {/* Left section: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h1>
        </div>
      </div>

      {/* Right section: User info & Date */}
      <div className="flex items-center gap-6">
        {/* Date */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate()}</span>
        </div>

        {/* User Greet */}
        {user && (
          <div className="text-right">
            <span className="block text-xs text-slate-400">{getGreeting()},</span>
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
