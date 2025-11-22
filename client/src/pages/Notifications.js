import React from 'react';
import { FiBell } from 'react-icons/fi';

const Notifications = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h2>
        <div className="text-center py-16">
          <FiBell size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">When someone interacts with you, you'll see it here</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
