import React, { useState } from 'react';
import { FiStar, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CelebrationPostCreator = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    count: 1000,
    type: 'COMMUNITY',
    message: ''
  });

  const milestones = [
    { value: 100, label: '100 Members', icon: '🎯' },
    { value: 500, label: '500 Members', icon: '🚀' },
    { value: 1000, label: '1K Members', icon: '🎉' },
    { value: 1100, label: '1.1K Members', icon: '✨' },
    { value: 5000, label: '5K Members', icon: '🔥' },
    { value: 10000, label: '10K Members', icon: '🌟' },
    { value: 50000, label: '50K Members', icon: '💎' },
    { value: 100000, label: '100K Members', icon: '👑' }
  ];

  const communityTypes = [
    'EDUHELPER [COMMUNITY]',
    'STUDY COMMUNITY',
    'LEARNING FAMILY',
    'EDUCATION HUB',
    'KNOWLEDGE NETWORK',
    'STUDENT CIRCLE'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const milestone = formData.count >= 1000 
        ? `${(formData.count / 1000).toFixed(1)}K` 
        : formData.count.toString();

      const content = formData.message || 
        `🎉 Thank you for being part of our ${milestone} member family! Your support means everything to us! ✨`;

      const response = await api.post('/posts', {
        content,
        isCelebration: true,
        celebrationData: {
          count: formData.count,
          type: formData.type,
          milestone
        }
      });

      toast.success('🎉 Celebration post created!');
      setFormData({ count: 1000, type: 'COMMUNITY', message: '' });
    } catch (error) {
      console.error('Error creating celebration post:', error);
      toast.error(error.response?.data?.message || 'Failed to create celebration post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <FiStar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Celebration Post</h2>
              <p className="text-purple-100">Celebrate your community milestones!</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Milestone Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <FiUsers className="inline w-4 h-4 mr-2" />
              Select Milestone
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {milestones.map((milestone) => (
                <button
                  key={milestone.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, count: milestone.value })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.count === milestone.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{milestone.icon}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {milestone.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Or Enter Custom Count
            </label>
            <input
              type="number"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="1"
            />
          </div>

          {/* Community Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FiTrendingUp className="inline w-4 h-4 mr-2" />
              Community Name
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {communityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Leave empty for default celebration message..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
            <div className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
              Preview:
            </div>
            <div className="text-center space-y-2">
              <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formData.count >= 1000 
                  ? `${(formData.count / 1000).toFixed(1)}K` 
                  : formData.count}
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                MEMBER FAMILY
              </div>
              <div className="text-purple-600 dark:text-purple-400 font-medium">
                {formData.type}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>🎉</span>
                <span>Create Celebration Post</span>
                <span>✨</span>
              </span>
            )}
          </button>
        </form>

        {/* Tips */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">💡 Tips:</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Choose significant milestones to keep them special</li>
            <li>• Custom messages can include emojis for extra flair</li>
            <li>• The post will appear with special celebration UI on the feed</li>
            <li>• Users can react to celebration posts just like regular posts</li>
            <li>• Different milestone counts get different color schemes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CelebrationPostCreator;
