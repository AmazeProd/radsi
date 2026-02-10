import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    setFormError('');

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/feed');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-canvas)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px] -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-64 h-64 bg-[var(--accent-strong)]/10 rounded-full blur-[100px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 card-glass-static p-10 animate-fadeInScale">
        <div>
          <div className="flex justify-center mb-4 animate-fadeIn">
            <img src="/assets/logotext.png" alt="Radsi" className="h-32 w-auto drop-shadow-lg" />
          </div>
          <h2 className="text-center text-4xl font-bold text-[var(--text-primary)] animate-slideIn delay-100">
            Create Account
          </h2>
          <p className="mt-3 text-center text-base text-[var(--text-muted)] animate-slideIn delay-200">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-strong)] font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 animate-slideInFromBottom delay-300" onSubmit={handleSubmit}>
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <FiAlertCircle size={16} className="flex-shrink-0" />
              {formError}
            </div>
          )}
          <div className="space-y-5">
            <div className="group">
              <label htmlFor="username" className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-glass w-full pl-12 pr-4 py-3.5"
                  placeholder="Choose a username"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="firstName" className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-glass w-full pl-12 pr-4 py-3.5"
                    placeholder="First name"
                  />
                </div>
              </div>
              <div className="group">
                <label htmlFor="lastName" className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                  Last name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-glass w-full pl-12 pr-4 py-3.5"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-glass w-full pl-12 pr-4 py-3.5"
                  placeholder="Create a password"
                />
              </div>
            </div>
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-glass w-full pl-12 pr-4 py-3.5"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full flex items-center justify-center gap-2 py-4 text-base font-semibold group"
          >
            {loading ? 'Creating account...' : (
              <>
                Create Account
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
