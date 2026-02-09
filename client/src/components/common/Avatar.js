import React from 'react';
import { Link } from 'react-router-dom';

const getInitials = (user) => {
  if (!user) return 'U';
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

/**
 * Unified Avatar Component
 * @param {Object} props
 * @param {Object} props.user - User object containing profile info
 * @param {string} props.size - Size variant: 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
 * @param {boolean} props.clickable - Whether avatar is clickable/linkable (default: true)
 * @param {boolean} props.showRing - Whether to show ring around avatar (default: true)
 * @param {string} props.ringColor - Custom ring color (default: uses theme)
 * @param {string} props.className - Additional custom classes
 * @param {Function} props.onClick - Custom click handler (overrides link behavior)
 */
const Avatar = ({ 
  user, 
  size = 'md', 
  clickable = true, 
  showRing = true,
  ringColor = null,
  className = '',
  onClick = null
}) => {
  // Size mappings
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-32 h-32 text-4xl',
    '3xl': 'w-40 h-40 text-5xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Ring styles
  const ringClass = showRing 
    ? ringColor 
      ? `ring-2 ${ringColor}` 
      : 'ring-2 ring-[var(--surface-border)] hover:ring-[var(--accent)] dark:ring-gray-700'
    : '';

  // Get profile picture URL - support both 'profilePicture' and 'avatar' properties
  const profilePicUrl = user?.profilePicture || user?.avatar;
  const hasRealPhoto = profilePicUrl && !profilePicUrl.includes('ui-avatars.com');

  // Avatar content
  const avatarContent = hasRealPhoto ? (
    <img
      src={profilePicUrl}
      alt={user?.username || 'User'}
      className={`${sizeClass} rounded-full object-cover ${ringClass} transition-all duration-300 ${className}`}
    />
  ) : (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg ${ringClass} transition-all duration-300 ${className}`}
    >
      {getInitials(user)}
    </div>
  );

  // Handle click behavior
  if (onClick) {
    return (
      <button onClick={onClick} className="focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-full">
        {avatarContent}
      </button>
    );
  }

  // Make clickable with link
  if (clickable && user?._id) {
    return (
      <Link to={`/profile/${user._id}`} className="focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-full">
        {avatarContent}
      </Link>
    );
  }

  // Static avatar (no interaction)
  return avatarContent;
};

export default Avatar;
