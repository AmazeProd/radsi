import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiMessageCircle, FiImage, FiTrendingUp, FiZap, FiHeart } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" />;
  }

  return (
    <div className="min-h-screen bg-github-canvas relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-github-blue/5 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-github-blue/5 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fadeIn">
            <img src="/assets/logo.png" alt="Radsi Corp" className="h-20 w-auto filter brightness-0 invert drop-shadow-2xl" />
          </div>
          
          <h1 className="text-7xl md:text-8xl font-extrabold text-github-heading mb-6 tracking-tight animate-fadeInScale">
            Welcome to <span className="text-github-blue">Radsi</span>
          </h1>
          <p className="text-2xl md:text-3xl text-github-text mb-4 max-w-4xl mx-auto leading-relaxed font-light animate-slideIn delay-100">
            Connect. Share. Inspire.
          </p>
          <p className="text-lg md:text-xl text-primary-300 mb-12 max-w-3xl mx-auto animate-slideIn delay-200">
            Join thousands sharing their moments and building meaningful connections in a vibrant community
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-12 animate-slideInFromBottom delay-300">
            <Link
              to="/register"
              className="bg-github-blue text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-accent-dark transition-all transform hover:scale-105 shadow-github-lg flex items-center justify-center gap-2"
            >
              <FiZap size={24} />
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-transparent border border-github-border text-github-text px-12 py-4 rounded-lg text-lg font-semibold hover:bg-github-card hover:border-primary-500 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-github-text">
            <div className="text-center transform hover:scale-110 transition-transform animate-fadeIn delay-100">
              <p className="text-4xl font-bold text-github-heading">10K+</p>
              <p className="text-sm text-primary-300">Active Users</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform animate-fadeIn delay-200">
              <p className="text-4xl font-bold text-github-heading">50K+</p>
              <p className="text-sm text-primary-300">Posts Shared</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform animate-fadeIn delay-300">
              <p className="text-4xl font-bold text-github-heading">100K+</p>
              <p className="text-sm text-primary-300">Connections Made</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-github-heading text-center mb-12">
            Why Choose <span className="text-github-blue">Radsi</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-github-card rounded-xl p-8 text-center hover:bg-primary-700 transition-all transform hover:scale-105 hover:-translate-y-1 border border-github-border animate-slideInFromBottom">
              <div className="bg-github-blue/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5 border border-github-blue/20 transition-transform hover:rotate-12">
                <FiUsers className="text-github-blue" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-github-heading">Connect</h3>
              <p className="text-github-text leading-relaxed">Build your network and follow friends across the globe</p>
            </div>
            
            <div className="bg-github-card rounded-xl p-8 text-center hover:bg-primary-700 transition-all transform hover:scale-105 hover:-translate-y-1 border border-github-border animate-slideInFromBottom delay-100">
              <div className="bg-github-green/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5 border border-github-green/20 transition-transform hover:rotate-12">
                <FiMessageCircle className="text-github-green" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-github-heading">Chat</h3>
              <p className="text-github-text leading-relaxed">Real-time messaging with lightning-fast delivery</p>
            </div>
            
            <div className="bg-github-card rounded-xl p-8 text-center hover:bg-primary-700 transition-all transform hover:scale-105 hover:-translate-y-1 border border-github-border animate-slideInFromBottom delay-200">
              <div className="bg-purple-500/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5 border border-purple-500/20 transition-transform hover:rotate-12">
                <FiImage className="text-purple-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-github-heading">Share</h3>
              <p className="text-github-text leading-relaxed">Post photos, videos, and moments that matter</p>
            </div>
            
            <div className="bg-github-card rounded-xl p-8 text-center hover:bg-primary-700 transition-all transform hover:scale-105 hover:-translate-y-1 border border-github-border animate-slideInFromBottom delay-300">
              <div className="bg-orange-500/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5 border border-orange-500/20 transition-transform hover:rotate-12">
                <FiTrendingUp className="text-orange-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-github-heading">Discover</h3>
              <p className="text-github-text leading-relaxed">Explore trending topics and viral content</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-github-card rounded-xl p-12 border border-github-border max-w-4xl mx-auto animate-fadeInScale">
            <FiHeart className="text-github-blue mx-auto mb-6" size={64} />
            <h2 className="text-4xl font-bold text-github-heading mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-github-text mb-8">
              Join our growing community and experience social networking reimagined
            </p>
            <Link
              to="/register"
              className="inline-block bg-github-blue text-white px-16 py-4 rounded-lg text-lg font-semibold hover:bg-accent-dark transition-all transform hover:scale-105 shadow-github-lg"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
