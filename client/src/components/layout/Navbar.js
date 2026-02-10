import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiHome, FiUser, FiSearch, FiBell, FiMail, FiLogOut, FiMoon, FiSun, FiPlusSquare, FiSettings } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close profile menu on route change
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  if (loading) return null;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Guest navbar
  if (!isAuthenticated) {
    return (
      <nav className="nav-glass sticky top-0 z-50">
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
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded-xl hover:bg-[var(--bg-soft)] transition-all duration-200"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <Link to="/login" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
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

  // Bottom bar nav items
  const mobileNavItems = [
    { path: '/feed', icon: FiHome, label: 'Home' },
    { path: '/search', icon: FiSearch, label: 'Explore' },
    { path: '/notifications', icon: FiBell, label: 'Alerts' },
    { path: '/messages', icon: FiMail, label: 'Chat' },
    { path: `/profile/${user?.id}`, icon: FiUser, label: 'Profile' },
  ];

  // Desktop top bar nav items
  const desktopNavItems = [
    { path: '/feed', icon: FiHome, label: 'Home' },
    { path: '/search', icon: FiSearch, label: 'Explore' },
    { path: '/messages', icon: FiMail, label: 'Messages' },
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
  ];

  return (
    <>
      {/* ── Desktop Top Bar ── */}
      <nav className="hidden md:block nav-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link to="/feed" className="flex items-center flex-shrink-0">
              <img src="/assets/logotext.png" alt="Radsi" className="h-10 w-auto" />
            </Link>

            {/* Center Nav Icons */}
            <div className="flex items-center gap-1">
              {desktopNavItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  title={label}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive(path)
                      ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-soft)]'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden lg:inline">{label}</span>
                  {isActive(path) && (
                    <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-[var(--accent)]" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side: Theme + Profile Dropdown */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2.5 rounded-xl hover:bg-[var(--bg-soft)] transition-all duration-200"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  title="Admin Panel"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2.5 rounded-xl hover:bg-[var(--bg-soft)] transition-all duration-200"
                >
                  <MdAdminPanelSettings size={18} />
                </Link>
              )}

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-2 p-1 pr-2 rounded-xl transition-all duration-200 ${
                    profileMenuOpen
                      ? 'bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30'
                      : 'hover:bg-[var(--bg-soft)]'
                  }`}
                >
                  <Avatar user={{ ...user, _id: user?.id }} size="sm" clickable={false} />
                  <span className="text-sm font-medium text-[var(--text-primary)] hidden lg:inline max-w-[100px] truncate">{user?.username}</span>
                </button>

                {/* Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 context-menu animate-scaleIn origin-top-right">
                    <Link
                      to={`/profile/${user?.id}`}
                      className="context-menu-item"
                    >
                      <FiUser size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="context-menu-item"
                    >
                      <FiSettings size={16} />
                      <span>Settings</span>
                    </Link>
                    <div className="context-menu-separator" />
                    <button
                      onClick={handleLogout}
                      className="context-menu-item danger w-full"
                    >
                      <FiLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Top Bar (slim, logo + theme + avatar) ── */}
      <nav className="md:hidden nav-glass sticky top-0 z-50">
        <div className="flex justify-between items-center h-12 px-4">
          <Link to="/feed" className="flex items-center">
            <img src="/assets/logotext.png" alt="Radsi" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded-xl transition-all duration-200"
            >
              {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded-xl transition-all duration-200">
                <MdAdminPanelSettings size={16} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 mobile-bottom-bar">
        <div className="flex justify-around items-center h-16 px-2">
          {mobileNavItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-[var(--accent)]/15 scale-110' : ''}`}>
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  {active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                  )}
                </div>
                <span className={`text-[10px] font-medium leading-tight ${active ? 'text-[var(--accent)]' : ''}`}>{label}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area spacer for notched phones */}
        <div className="h-safe-bottom" />
      </div>
    </>
  );
};

export default Navbar;
