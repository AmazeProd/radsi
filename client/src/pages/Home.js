import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiMessageCircle, FiImage, FiTrendingUp, FiZap, FiShield, FiGlobe, FiAward, FiCheckCircle } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/assets/logotext.png" alt="Radsi Corp" className="h-16 sm:h-20 md:h-22 lg:h-24 w-auto" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-3 sm:px-4 md:px-6 py-2 transition text-sm sm:text-base">
              Sign In
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 text-sm sm:text-base">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                <FiZap size={14} className="sm:w-4 sm:h-4" />
                <span>Next-generation social platform</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Social Connection
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                Enterprise-grade social networking platform designed for modern teams and communities. 
                Connect, collaborate, and grow with cutting-edge technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl text-sm sm:text-base md:text-lg font-semibold hover:bg-blue-700 transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <FiZap size={18} className="sm:w-5 sm:h-5" />
                </Link>
                <Link
                  to="/login"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2"
                >
                  <FiUsers size={18} className="sm:w-5 sm:h-5" />
                  Sign In
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-500 w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-500 w-4 h-4" />
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                    <FiUsers size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                    <p className="text-2xl sm:text-3xl font-bold mb-1">Unlimited</p>
                    <p className="text-blue-100 text-xs sm:text-sm">Connections</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                    <FiMessageCircle size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                    <p className="text-2xl sm:text-3xl font-bold mb-1">Instant</p>
                    <p className="text-purple-100 text-xs sm:text-sm">Messaging</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                    <FiGlobe size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                    <p className="text-2xl sm:text-3xl font-bold mb-1">Global</p>
                    <p className="text-green-100 text-xs sm:text-sm">Platform</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                    <FiTrendingUp size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                    <p className="text-2xl sm:text-3xl font-bold mb-1">99.9%</p>
                    <p className="text-orange-100 text-xs sm:text-sm">Uptime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-6 sm:py-10 md:py-12 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-6 sm:mb-8">
            Built with cutting-edge technology
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-50">
            <div className="text-lg sm:text-2xl font-bold text-gray-400 dark:text-gray-600">REACT</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-400 dark:text-gray-600">NODE.JS</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-400 dark:text-gray-600">MONGODB</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-400 dark:text-gray-600">SOCKET.IO</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-400 dark:text-gray-600">AWS</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Enterprise Solutions for Modern Teams
            </h2>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              Comprehensive features designed to power your organization's social collaboration
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-xl transition group">
              <div className="bg-blue-50 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-blue-100 transition">
                <FiUsers className="text-blue-600 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Team Collaboration</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4">
                Build and manage teams with advanced permission controls and role-based access
              </p>
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-2 text-sm sm:text-base">
                Learn more →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-600 hover:shadow-xl transition group">
              <div className="bg-purple-50 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-purple-100 transition">
                <FiMessageCircle className="text-purple-600 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Real-Time Messaging</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4">
                Instant messaging with enterprise-grade encryption and compliance features
              </p>
              <Link to="/register" className="text-purple-600 font-semibold hover:text-purple-700 inline-flex items-center gap-2 text-sm sm:text-base">
                Learn more →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-600 hover:shadow-xl transition group">
              <div className="bg-green-50 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-green-100 transition">
                <FiShield className="text-green-600 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Security First</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4">
                Bank-level security with end-to-end encryption and SOC 2 Type II compliance
              </p>
              <Link to="/register" className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-2 text-sm sm:text-base">
                Learn more →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-600 hover:shadow-xl transition group">
              <div className="bg-orange-50 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-orange-100 transition">
                <FiImage className="text-orange-600 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Media Management</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4">
                Share and organize multimedia content with AI-powered tagging and search
              </p>
              <Link to="/register" className="text-orange-600 font-semibold hover:text-orange-700 inline-flex items-center gap-2 text-sm sm:text-base">
                Learn more →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-xl transition group">
              <div className="bg-indigo-50 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-indigo-100 transition">
                <FiTrendingUp className="text-indigo-600 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Analytics & Insights</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4">
                Comprehensive analytics dashboard with real-time engagement metrics
              </p>
              <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 inline-flex items-center gap-2 text-sm sm:text-base">
                Learn more →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-pink-200 dark:hover:border-pink-600 hover:shadow-xl transition group">
              <div className="bg-pink-50 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-pink-100 transition">
                <FiGlobe className="text-pink-600 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Global Scale</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4">
                Multi-region deployment with CDN integration for optimal performance
              </p>
              <Link to="/register" className="text-pink-600 font-semibold hover:text-pink-700 inline-flex items-center gap-2 text-sm sm:text-base">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose Radsi
            </h2>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400">
              The most advanced social platform for your organization
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-800">
              <FiAward className="text-blue-600 mb-3 sm:mb-4 w-8 h-8 sm:w-10 sm:h-10" />
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Innovation</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Latest technology stack and features</p>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">Cutting-edge platform</div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-800">
              <FiShield className="text-green-600 mb-3 sm:mb-4 w-8 h-8 sm:w-10 sm:h-10" />
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">99.9% Uptime</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Enterprise reliability with 24/7 support</p>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">Always available</div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg sm:col-span-2 lg:col-span-1 border border-gray-100 dark:border-gray-800">
              <FiGlobe className="text-purple-600 mb-3 sm:mb-4 w-8 h-8 sm:w-10 sm:h-10" />
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Global Ready</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Multi-language, worldwide platform</p>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">Built for everyone</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-xl text-blue-100 mb-8 sm:mb-10">
            Be among the first to experience the future of social networking
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-50 transition shadow-2xl inline-flex items-center justify-center gap-2"
            >
              Start Free Trial
              <FiZap size={18} className="sm:w-5 sm:h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-white/10 transition inline-flex items-center justify-center gap-2"
            >
              Sign In
            </Link>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm mt-4 sm:mt-6">
            No credit card required • Free forever plan • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <img src="/assets/logotext.png" alt="Radsi" className="h-20 sm:h-24 w-auto" />
          </div>
          <p className="text-xs sm:text-sm">
            © 2025 Radsi Corporation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
