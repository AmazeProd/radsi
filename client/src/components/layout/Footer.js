import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 mt-auto border-t border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <img src="/assets/logotext.png" alt="Radsi Corp" className="h-24 w-auto" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your Social Connection Hub</p>
          </div>

          {/* Made in India */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🇮🇳</span>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Made in India</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              Crafted with <span className="text-red-400 text-lg">❤️</span>
            </p>
          </div>

          {/* Creator Info */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Developed by</p>
            <p className="text-xl font-bold bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              Naitik Tiwari
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Radsi Corp. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link to="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition">Privacy Policy</Link>
              <Link to="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition">Terms of Service</Link>
              <Link to="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
