import React from 'react';
import { FiBell } from 'react-icons/fi';

const Notifications = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notifications</h2>
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <FiBell size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">When someone interacts with you, you'll see it here</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
