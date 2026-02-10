import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
      <div className="text-center">
        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] bg-clip-text text-transparent">404</h1>
        <p className="text-2xl text-[var(--text-muted)] mb-8">Page not found</p>
        <Link
          to="/feed"
          className="btn-accent inline-flex items-center px-6 py-3"
        >
          Go to Feed
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
