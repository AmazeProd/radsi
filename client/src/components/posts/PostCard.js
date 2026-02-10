import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const PostCard = ({ post, onLike, onDelete, currentImageIndex, onNextImage, onPrevImage }) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const currentIndex = currentImageIndex || 0;

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now - postDate) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return postDate.toLocaleDateString();
  };

  const isLiked = post.isLiked;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar user={post.user} size="md" />
          <div>
            <Link to={`/profile/${post.user?._id}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {post.user?.firstName && post.user?.lastName ? 
                `${post.user.firstName} ${post.user.lastName}` : 
                post.user?.username}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{post.user?.username} · {formatTime(post.createdAt)}
            </p>
          </div>
        </div>
        
        {user?._id === post.user?._id && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <FiMoreHorizontal className="w-5 h-5" />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      onDelete(post._id);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 text-[15px] whitespace-pre-wrap break-words leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Images */}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNextImage(post._id, post.images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-white w-5' : 'bg-white/50 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLike && onLike(post._id, isLiked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
              isLiked
                ? 'text-red-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-400'
            }`}
          >
            {isLiked ? (
              <FaHeart className="w-[18px] h-[18px] text-red-500 animate-like-pop" />
            ) : (
              <FiHeart className="w-[18px] h-[18px]" />
            )}
            <span className="font-medium">{post.likesCount || 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm transition-all">
            <FiMessageCircle className="w-4 h-4" />
            <span className="font-medium">{post.commentsCount || 0}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm transition-all">
            <FiShare2 className="w-4 h-4" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
