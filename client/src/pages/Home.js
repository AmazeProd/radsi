import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiMessageCircle, FiImage, FiTrendingUp, FiZap, FiShield, FiGlobe, FiAward, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-canvas)' }}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 nav-glass z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/assets/logotext.png" alt="Radsi Corp" className="h-16 sm:h-20 md:h-22 lg:h-24 w-auto" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link to="/login" className="btn-ghost px-4 sm:px-5 py-2 text-sm sm:text-base">
              Sign In
            </Link>
            <Link to="/register" className="btn-accent px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-sm sm:text-base">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6 md:px-8 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent-strong)]/8 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="animate-fadeIn">
              <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6">
                <FiZap size={14} />
                <span>Next-generation social platform</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[var(--text-primary)] mb-6 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] bg-clip-text text-transparent">
                  Social Connection
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[var(--text-muted)] mb-8 leading-relaxed max-w-xl">
                Enterprise-grade social networking platform designed for modern teams and communities. 
                Connect, collaborate, and grow with cutting-edge technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <Link
                  to="/register"
                  className="btn-accent px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <FiArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="btn-ghost px-8 py-3.5 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-2"
                >
                  <FiUsers size={18} />
                  Sign In
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-xs sm:text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[var(--accent-strong)] w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[var(--accent-strong)] w-4 h-4" />
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent-strong)]/15 rounded-3xl blur-3xl animate-pulse" />
              <div className="relative card-glass-static p-6 sm:p-8 rounded-2xl sm:rounded-3xl">
                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div className="bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:border-[var(--accent)]/40 transition-all">
                    <FiUsers size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-3 text-[var(--accent)]" />
                    <p className="text-2xl sm:text-3xl font-bold mb-1 text-[var(--text-primary)]">Unlimited</p>
                    <p className="text-[var(--text-muted)] text-xs sm:text-sm">Connections</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:border-purple-500/40 transition-all">
                    <FiMessageCircle size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-3 text-purple-400" />
                    <p className="text-2xl sm:text-3xl font-bold mb-1 text-[var(--text-primary)]">Instant</p>
                    <p className="text-[var(--text-muted)] text-xs sm:text-sm">Messaging</p>
                  </div>
                  <div className="bg-gradient-to-br from-[var(--accent-strong)]/20 to-[var(--accent-strong)]/5 border border-[var(--accent-strong)]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:border-[var(--accent-strong)]/40 transition-all">
                    <FiGlobe size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-3 text-[var(--accent-strong)]" />
                    <p className="text-2xl sm:text-3xl font-bold mb-1 text-[var(--text-primary)]">Global</p>
                    <p className="text-[var(--text-muted)] text-xs sm:text-sm">Platform</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:border-amber-500/40 transition-all">
                    <FiTrendingUp size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-3 text-amber-400" />
                    <p className="text-2xl sm:text-3xl font-bold mb-1 text-[var(--text-primary)]">99.9%</p>
                    <p className="text-[var(--text-muted)] text-xs sm:text-sm">Uptime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 sm:py-12 border-y border-[var(--surface-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[var(--text-muted)] text-xs sm:text-sm font-semibold uppercase tracking-widest mb-6 sm:mb-8">
            Built with cutting-edge technology
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-40">
            <div className="text-lg sm:text-2xl font-bold text-[var(--text-muted)]">REACT</div>
            <div className="text-lg sm:text-2xl font-bold text-[var(--text-muted)]">NODE.JS</div>
            <div className="text-lg sm:text-2xl font-bold text-[var(--text-muted)]">MONGODB</div>
            <div className="text-lg sm:text-2xl font-bold text-[var(--text-muted)]">SOCKET.IO</div>
            <div className="text-lg sm:text-2xl font-bold text-[var(--text-muted)]">AWS</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 relative">
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Enterprise Solutions for Modern Teams
            </h2>
            <p className="text-base sm:text-xl text-[var(--text-muted)] max-w-3xl mx-auto px-4">
              Comprehensive features designed to power your organization's social collaboration
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: FiUsers, title: 'Team Collaboration', desc: 'Build and manage teams with advanced permission controls and role-based access', color: 'var(--accent)' },
              { icon: FiMessageCircle, title: 'Real-Time Messaging', desc: 'Instant messaging with enterprise-grade encryption and compliance features', color: '#a78bfa' },
              { icon: FiShield, title: 'Security First', desc: 'Bank-level security with end-to-end encryption and SOC 2 Type II compliance', color: 'var(--accent-strong)' },
              { icon: FiImage, title: 'Media Management', desc: 'Share and organize multimedia content with AI-powered tagging and search', color: '#fb923c' },
              { icon: FiTrendingUp, title: 'Analytics & Insights', desc: 'Comprehensive analytics dashboard with real-time engagement metrics', color: '#60a5fa' },
              { icon: FiGlobe, title: 'Global Scale', desc: 'Multi-region deployment with CDN integration for optimal performance', color: '#f472b6' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="card-glass p-6 sm:p-8 group cursor-default"
              >
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 transition-all group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}08)`, border: `1px solid ${feature.color}25` }}
                >
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-[var(--text-primary)]">{feature.title}</h3>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
                  {feature.desc}
                </p>
                <Link to="/register" className="text-sm sm:text-base font-semibold inline-flex items-center gap-2 transition-all group-hover:gap-3" style={{ color: feature.color }}>
                  Learn more <FiArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 border-t border-[var(--surface-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Why Choose Radsi
            </h2>
            <p className="text-base sm:text-xl text-[var(--text-muted)]">
              The most advanced social platform for your organization
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="card-glass-static p-6 sm:p-8">
              <FiAward className="text-[var(--accent)] mb-4 w-8 h-8 sm:w-10 sm:h-10" />
              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Innovation</h3>
              <p className="text-sm sm:text-base text-[var(--text-muted)] mb-3">Latest technology stack and features</p>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] opacity-60">Cutting-edge platform</div>
            </div>

            <div className="card-glass-static p-6 sm:p-8">
              <FiShield className="text-[var(--accent-strong)] mb-4 w-8 h-8 sm:w-10 sm:h-10" />
              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">99.9% Uptime</h3>
              <p className="text-sm sm:text-base text-[var(--text-muted)] mb-3">Enterprise reliability with 24/7 support</p>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] opacity-60">Always available</div>
            </div>

            <div className="card-glass-static p-6 sm:p-8 sm:col-span-2 lg:col-span-1">
              <FiGlobe className="text-purple-400 mb-4 w-8 h-8 sm:w-10 sm:h-10" />
              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Global Ready</h3>
              <p className="text-sm sm:text-base text-[var(--text-muted)] mb-3">Multi-language, worldwide platform</p>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] opacity-60">Built for everyone</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-strong)]/10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-strong)] to-transparent opacity-30" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-xl text-[var(--text-muted)] mb-10">
            Be among the first to experience the future of social networking
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              to="/register"
              className="btn-accent px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg inline-flex items-center justify-center gap-2"
            >
              Start Free Trial
              <FiZap size={18} />
            </Link>
            <Link
              to="/login"
              className="btn-ghost px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg inline-flex items-center justify-center gap-2"
            >
              Sign In
            </Link>
          </div>
          <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-6 opacity-60">
            No credit card required · Free forever plan · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--surface-border)] py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <img src="/assets/logotext.png" alt="Radsi" className="h-20 sm:h-24 w-auto" />
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] opacity-60">
            © 2025 Radsi Corporation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
