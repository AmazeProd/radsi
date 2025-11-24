import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      navigate('/feed');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-github-canvas relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-github-blue/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-64 h-64 bg-github-green/10 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 bg-github-card p-10 rounded-2xl shadow-github-lg border border-github-border animate-fadeInScale backdrop-blur-sm">
        <div>
          <div className="flex justify-center mb-4 animate-fadeIn">
            <img src="/assets/logotext.png" alt="Radsi" className="h-32 w-auto drop-shadow-lg" />
          </div>
          <h2 className="text-center text-4xl font-bold text-github-heading animate-slideIn delay-100">
            Welcome Back
          </h2>
          <p className="mt-3 text-center text-base text-github-text animate-slideIn delay-200">
            Don't have an account?{' '}
            <Link to="/register" className="text-github-blue hover:text-blue-400 font-semibold transition-colors">
              Sign up now
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 animate-slideInFromBottom delay-300" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="group">
              <label htmlFor="username" className="block text-sm font-semibold text-github-text mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="text-github-text/50 group-focus-within:text-github-blue transition-colors" size={20} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-github-canvas border border-github-border text-github-text rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-github-blue focus:border-transparent transition-all placeholder-github-text/40"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-github-text mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-github-text/50 group-focus-within:text-github-blue transition-colors" size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-github-canvas border border-github-border text-github-text rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-github-blue focus:border-transparent transition-all placeholder-github-text/40"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="text-github-blue hover:text-blue-400 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-github-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-github-lg"
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
