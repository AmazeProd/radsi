import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-github-card text-github-text mt-auto border-t border-github-border">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="Radsi Corp" className="h-10 w-auto filter brightness-0 invert" />
            </div>
            <p className="text-sm text-primary-300">Your Social Connection Hub</p>
          </div>

          {/* Made in India */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🇮🇳</span>
              <p className="text-lg font-semibold text-github-heading">Made in India</p>
            </div>
            <p className="text-sm text-primary-300 flex items-center justify-center gap-1">
              Crafted with <span className="text-red-400 text-lg">❤️</span>
            </p>
          </div>

          {/* Creator Info */}
          <div className="text-center md:text-right">
            <p className="text-sm text-primary-300 mb-1">Developed by</p>
            <p className="text-xl font-bold bg-github-canvas px-4 py-2 rounded-lg border border-github-border text-github-heading">
              Naitik Tiwari
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-github-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-300">
              © {new Date().getFullYear()} Radsi Corp. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-primary-300">
              <Link to="#" className="hover:text-github-blue transition">Privacy Policy</Link>
              <Link to="#" className="hover:text-github-blue transition">Terms of Service</Link>
              <Link to="#" className="hover:text-github-blue transition">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
