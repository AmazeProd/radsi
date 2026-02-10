import React from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiShare2, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

const CelebrationPost = ({ post, onLike }) => {

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now - postDate) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  const getMilestoneColor = (count) => {
    if (count >= 10000) return 'from-yellow-400 via-orange-500 to-pink-500';
    if (count >= 5000) return 'from-purple-400 via-pink-500 to-red-500';
    if (count >= 1000) return 'from-blue-400 via-purple-500 to-pink-500';
    return 'from-green-400 via-blue-500 to-purple-500';
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 mb-4 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.user?._id}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-purple-400">
              {post.user?.firstName?.charAt(0) || 'C'}
            </div>
          </Link>
          <div>
            <Link to={`/profile/${post.user?._id}`} className="font-bold text-white hover:text-purple-400 transition-colors">
              {post.user?.firstName && post.user?.lastName ? 
                `${post.user.firstName} ${post.user.lastName}` : 
                post.user?.username}
            </Link>
            <p className="text-sm text-gray-400">
              {post.celebrationData?.count?.toLocaleString()} subscribers · {formatTime(post.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Celebration Content */}
      <div className="relative py-12 px-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center space-y-4">
          {/* Milestone Badge */}
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${getMilestoneColor(post.celebrationData?.count)} flex items-center justify-center shadow-2xl animate-pulse`}>
              <span className="text-4xl">🎓</span>
            </div>
          </div>

          {/* Milestone Number */}
          <div className={`text-7xl font-black bg-gradient-to-r ${getMilestoneColor(post.celebrationData?.count)} bg-clip-text text-transparent animate-fade-in`}>
            {post.celebrationData?.count?.toLocaleString()}
          </div>

          {/* Title */}
          <div className="text-4xl font-bold text-white animate-fade-in-delay">
            MEMBER FAMILY
          </div>

          {/* Subtitle */}
          <div className="text-purple-300 text-lg font-medium">
            {post.celebrationData?.type || 'EDUHELPER [COMMUNITY]'}
          </div>

          {/* Thank You Message */}
          <div className="pt-4">
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <p className="text-white font-medium">
                ✨ THANKS FOR BEING PART OF OUR JOURNEY! ✨
              </p>
            </div>
          </div>

          {/* Additional Content */}
          {post.content && (
            <p className="text-gray-300 max-w-2xl mx-auto pt-4">
              {post.content}
            </p>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 text-4xl animate-bounce">✨</div>
        <div className="absolute top-8 right-8 text-4xl animate-bounce delay-100">🎉</div>
        <div className="absolute bottom-4 left-8 text-4xl animate-bounce delay-200">🌟</div>
        <div className="absolute bottom-8 right-4 text-4xl animate-bounce delay-300">💫</div>
      </div>

      {/* Stats Bar */}
      <div className="bg-black/30 backdrop-blur-sm px-6 py-3 border-t border-purple-500/20">
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1">
              <span>👁️</span>
              <span>{(post.celebrationData?.count * 0.6).toFixed(0)}</span>
            </span>
          </div>
          <div>
            {formatTime(post.createdAt)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-purple-500/20 bg-black/20 backdrop-blur-sm flex items-center justify-between">
        <button
          onClick={() => onLike && onLike(post._id, post.isLiked)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
            post.isLiked
              ? 'text-red-500 bg-red-500/10'
              : 'text-purple-300 hover:text-red-400 hover:bg-purple-900/40'
          }`}
        >
          {post.isLiked ? (
            <FaHeart className="w-5 h-5 text-red-500 animate-like-pop" />
          ) : (
            <FiHeart className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{post.likesCount || 0}</span>
        </button>

        <div className="flex items-center space-x-1">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-purple-900/40 text-purple-300 hover:text-white transition-all">
            <FiMessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.commentsCount || 0}</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-purple-900/40 text-purple-300 hover:text-white transition-all">
            <FiShare2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrationPost;
