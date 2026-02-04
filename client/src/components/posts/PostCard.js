import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const REACTION_EMOJIS = ['❤️', '🔥', '👏', '😍', '💯', '🎉', '👍', '🙌'];

const getInitials = (user) => {
  if (user.firstName && user.firstName.trim() && user.lastName && user.lastName.trim()) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  if (user.firstName && user.firstName.trim()) {
    return user.firstName.charAt(0).toUpperCase();
  }
  if (user.username && user.username.trim()) {
    return user.username.charAt(0).toUpperCase();
  }
  return 'U';
};

const getAvatarColor = (str) => {
  return 'bg-gradient-to-br from-blue-500 to-purple-600';
};

const PostCard = ({ post, onReaction, onDelete, currentImageIndex, onNextImage, onPrevImage }) => {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const currentIndex = currentImageIndex || 0;

  const handleReactionClick = (emoji) => {
    onReaction(post._id, emoji);
    setShowReactions(false);
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now - postDate) / 1000); // seconds

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  const userReaction = post.reactions?.find(r => r.user === user?._id || r.user?._id === user?._id);

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 mb-4 overflow-hidden hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-purple-900/20 transition-all duration-300">
      {/* Post Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.user?._id}`}>
            {post.user?.avatar ? (
              <img 
                src={post.user.avatar} 
                alt={post.user.username}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-purple-500 transition-all"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full ${getAvatarColor(post.user?.username)} flex items-center justify-center text-white font-bold text-sm ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-purple-500 transition-all`}>
                {getInitials(post.user)}
              </div>
            )}
          </Link>
          <div>
            <Link to={`/profile/${post.user?._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {post.user?.firstName && post.user?.lastName ? 
                `${post.user.firstName} ${post.user.lastName}` : 
                post.user?.username}
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{post.user?.username} · {formatTime(post.createdAt)}
            </p>
          </div>
        </div>
        
        {user?._id === post.user?._id && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <FiMoreHorizontal className="w-5 h-5" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    onDelete(post._id);
                    setShowDropdown(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="relative group">
          <img 
            src={post.images[currentIndex]?.url} 
            alt="Post content"
            className="w-full max-h-[500px] object-cover"
          />
          
          {post.images.length > 1 && (
            <>
              <button
                onClick={() => onPrevImage(post._id, post.images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => onNextImage(post._id, post.images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {post.images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reactions Display */}
      {post.reactions && post.reactions.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2">
          {Object.entries(post.reactionCounts || {})
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([emoji, count]) => (
              <div
                key={emoji}
                className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700"
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {count}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                userReaction
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {userReaction ? (
                <>
                  <span className="text-xl">{userReaction.type}</span>
                  <span className="text-sm font-medium">Reacted</span>
                </>
              ) : (
                <>
                  <span className="text-xl">😊</span>
                  <span className="text-sm font-medium">React</span>
                </>
              )}
            </button>

            {showReactions && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 flex space-x-2 z-10 animate-scale-in">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    className="text-2xl hover:scale-125 transition-transform p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all">
            <FiMessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.commentsCount || 0}</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all">
            <FiShare2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
