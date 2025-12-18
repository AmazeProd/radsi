import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiHome, FiUser, FiSearch, FiBell, FiMail, FiMenu, FiX, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';

const getInitials = (user) => {
  if (user.firstName && user.firstName.trim() && user.lastName && user.lastName.trim()) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  if (user.firstName && user.firstName.trim()) {
    return user.firstName.charAt(0).toUpperCase();
  }
  if (user.username && user.username.trim()) {
    return user.username.charAt(0).toUpperCase();
  }
  return 'U';
};

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show nothing while checking authentication
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <nav className="bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-950 shadow-md transition-colors border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/assets/logotext.png" alt="Radsi Corp" className="h-20 w-auto" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-lg transition"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/feed" className="flex items-center">
              <img src="/assets/logotext.png" alt="NewsHub" className="h-20 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/feed"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
            >
              <FiHome size={22} />
              <span>Home</span>
            </Link>
            <Link
              to="/search"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
            >
              <FiSearch size={22} />
              <span>Explore</span>
            </Link>
            <Link
              to="/messages"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium relative"
            >
              <FiMail size={22} />
              <span>Messages</span>
            </Link>
            <Link
              to="/notifications"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium relative"
            >
              <FiBell size={22} />
              <span>Alerts</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <MdAdminPanelSettings size={20} />
              </Link>
            )}
            <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              {user?.profilePicture && !user.profilePicture.includes('ui-avatars.com') ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 hover:ring-primary-400 transition"
                />
              ) : (
                <div className="w-9 h-9 rounded-full ring-2 ring-gray-200 hover:ring-primary-400 transition flex items-center justify-center text-white text-sm font-bold bg-blue-500">
                  {getInitials(user)}
                </div>
              )}
              <span className="text-gray-800 dark:text-gray-200 font-medium">{user?.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t dark:border-gray-800 transition-colors">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {isDark ? <FiSun className="inline mr-2" /> : <FiMoon className="inline mr-2" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link
              to="/feed"
              className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiHome className="inline mr-2" />
              Home
            </Link>
            <Link
              to="/search"
              className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiSearch className="inline mr-2" />
              Search
            </Link>
            <Link
              to="/messages"
              className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiMail className="inline mr-2" />
              Messages
            </Link>
            <Link
              to="/notifications"
              className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiBell className="inline mr-2" />
              Notifications
            </Link>
            <Link
              to={`/profile/${user?.id}`}
              className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiUser className="inline mr-2" />
              Profile
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MdAdminPanelSettings className="inline mr-2" />
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FiLogOut className="inline mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
