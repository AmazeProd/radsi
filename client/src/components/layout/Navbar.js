import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiHome, FiUser, FiSearch, FiBell, FiMail, FiMenu, FiX, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return null;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive(path)
      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
  }`;

  // Guest navbar
  if (!isAuthenticated) {
    return (
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/assets/logotext.png" alt="Radsi Corp" className="h-10 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition">
                Login
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/feed" className="flex items-center flex-shrink-0">
            <img src="/assets/logotext.png" alt="Radsi" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/feed" className={navLinkClass('/feed')}>
              <FiHome size={18} />
              <span>Home</span>
            </Link>
            <Link to="/search" className={navLinkClass('/search')}>
              <FiSearch size={18} />
              <span>Explore</span>
            </Link>
            <Link to="/messages" className={navLinkClass('/messages')}>
              <FiMail size={18} />
              <span>Messages</span>
            </Link>
            <Link to="/notifications" className={navLinkClass('/notifications')}>
              <FiBell size={18} />
              <span>Alerts</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <MdAdminPanelSettings size={18} />
              </Link>
            )}
            <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Avatar user={{ ...user, _id: user?.id }} size="sm" clickable={false} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-500 dark:text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              title="Logout"
            >
              <FiLogOut size={18} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-3 py-2 space-y-0.5">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link
              to="/feed"
              className={navLinkClass('/feed')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiHome size={18} />
              Home
            </Link>
            <Link
              to="/search"
              className={navLinkClass('/search')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiSearch size={18} />
              Search
            </Link>
            <Link
              to="/messages"
              className={navLinkClass('/messages')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiMail size={18} />
              Messages
            </Link>
            <Link
              to="/notifications"
              className={navLinkClass('/notifications')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiBell size={18} />
              Notifications
            </Link>
            <Link
              to={`/profile/${user?.id}`}
              className={navLinkClass(`/profile/${user?.id}`)}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiUser size={18} />
              Profile
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={navLinkClass('/admin')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <MdAdminPanelSettings size={18} />
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
