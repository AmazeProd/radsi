import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiChevronLeft, FiChevronRight, FiHeart, FiBookmark } from 'react-icons/fi';
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
    <div className="card-glass overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar user={post.user} size="md" />
          <div>
            <Link to={`/profile/${post.user?._id}`} className="font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
              {post.user?.firstName && post.user?.lastName ? 
                `${post.user.firstName} ${post.user.lastName}` : 
                post.user?.username}
            </Link>
            <p className="text-xs text-[var(--text-muted)]">
              @{post.user?.username} · {formatTime(post.createdAt)}
            </p>
          </div>
        </div>
        
        {user?._id === post.user?._id && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <FiMoreHorizontal className="w-5 h-5" />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-1 w-44 dropdown-glass z-20">
                  <button
                    onClick={() => {
                      onDelete(post._id);
                      setShowDropdown(false);
                    }}
                    className="dropdown-glass-item danger w-full"
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
        <p className="text-[var(--text-primary)] text-[15px] whitespace-pre-wrap break-words leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="relative group mx-4 mb-3 rounded-xl overflow-hidden">
          <img 
            src={post.images[currentIndex]?.url} 
            alt="Post content"
            className="w-full max-h-[500px] object-cover"
          />
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
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
                      idx === currentIndex ? 'bg-[var(--accent)] w-5' : 'bg-white/50 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-[var(--surface-border)] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLike && onLike(post._id, isLiked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
              isLiked
                ? 'text-red-500'
                : 'hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400'
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
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] text-sm transition-all">
            <FiMessageCircle className="w-4 h-4" />
            <span className="font-medium">{post.commentsCount || 0}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] text-sm transition-all">
            <FiShare2 className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-400 text-sm transition-all">
            <FiBookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
