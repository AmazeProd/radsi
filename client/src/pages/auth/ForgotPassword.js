import React from 'react';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-canvas)' }}>
      <div className="max-w-md w-full card-glass-static p-8">
        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Forgot Password</h2>
        <p className="text-[var(--text-muted)] mb-4">Enter your email to receive a password reset link.</p>
        {/* Implementation here */}
      </div>
    </div>
  );
};

export default ForgotPassword;
