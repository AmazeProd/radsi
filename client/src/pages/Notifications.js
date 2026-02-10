import React from 'react';
import { FiBell } from 'react-icons/fi';

const Notifications = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="card-glass-static p-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h2>
          <div className="flex-1 glow-line" />
        </div>
        <div className="text-center py-16">
          <div className="empty-state-icon">
            <FiBell size={28} />
          </div>
          <p className="text-[var(--text-primary)] font-medium">No notifications yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">When someone interacts with you, you'll see it here</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
