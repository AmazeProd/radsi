import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiHome, FiUser, FiSearch, FiBell, FiMail, FiMenu, FiX, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return null;

  // Guest navbar
  if (!isAuthenticated) {
    return (
      <nav className="nav-glass shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/assets/logotext.png" alt="Radsi Corp" className="h-12 w-auto" />
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="text-[var(--text-primary)] hover:text-[var(--accent)] p-2 rounded-lg transition"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <Link to="/login" className="muted-link px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link to="/register" className="pill-button text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/feed" className="flex items-center">
              <img src="/assets/logotext.png" alt="NewsHub" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/feed"
              className="text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition font-medium"
            >
              <FiHome size={22} />
              <span>Home</span>
            </Link>
            <Link
              to="/search"
              className="text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition font-medium"
            >
              <FiSearch size={22} />
              <span>Explore</span>
            </Link>
            <Link
              to="/messages"
              className="text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition font-medium relative"
            >
              <FiMail size={22} />
              <span>Messages</span>
            </Link>
            <Link
              to="/notifications"
              className="text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition font-medium relative"
            >
              <FiBell size={22} />
              <span>Alerts</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] p-2 rounded-lg hover:bg-white/5 transition"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition"
              >
                <MdAdminPanelSettings size={20} />
              </Link>
            )}
            <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition">
              <Avatar user={{ ...user, _id: user?.id }} size="sm" clickable={false} />
              <span className="text-[var(--text-primary)] font-medium">{user?.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-[var(--text-muted)] hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[var(--text-primary)] hover:text-[var(--accent)] transition"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg-soft)] border-t border-[var(--surface-border)] transition-colors">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-3 py-2 rounded-md text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--accent)] transition"
            >
              {isDark ? <FiSun className="inline mr-2" /> : <FiMoon className="inline mr-2" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link
              to="/feed"
              className="block px-3 py-2 rounded-md text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--accent)] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiHome className="inline mr-2" />
              Home
            </Link>
            <Link
              to="/search"
              className="block px-3 py-2 rounded-md text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--accent)] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiSearch className="inline mr-2" />
              Search
            </Link>
            <Link
              to="/messages"
              className="block px-3 py-2 rounded-md text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--accent)] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiMail className="inline mr-2" />
              Messages
            </Link>
            <Link
              to="/notifications"
              className="block px-3 py-2 rounded-md text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--accent)] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiBell className="inline mr-2" />
              Notifications
            </Link>
            <Link
              to={`/profile/${user?.id}`}
              className="block px-3 py-2 rounded-md text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--accent)] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiUser className="inline mr-2" />
              Profile
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--accent)] transition"
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
              className="block w-full text-left px-3 py-2 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-900/20 transition"
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
