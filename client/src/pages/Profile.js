import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, followUser, unfollowUser, uploadProfilePicture } from '../services/userService';
import { getUserPosts, deletePost, likePost, unlikePost } from '../services/postService';
import { FiHeart, FiMessageCircle, FiMoreHorizontal, FiMail, FiSettings, FiTrash2, FiMapPin, FiLink, FiCalendar, FiImage } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import ProfilePhotoUpload from '../components/profile/ProfilePhotoUpload';
import Avatar from '../components/common/Avatar';
import ConfirmModal from '../components/common/ConfirmModal';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, loadUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const isOwnProfile = currentUser && userId && (
    currentUser._id === userId || 
    currentUser.id === userId || 
    currentUser._id?.toString() === userId || 
    currentUser.id?.toString() === userId
  );

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await getUserProfile(userId);
      const profile = response.data;
      if (profile.profilePicture && profile.profilePicture.startsWith('/uploads/')) {
        const apiUrl = process.env.REACT_APP_API_URL || 'https://radsi-backend.onrender.com/api';
        const baseUrl = apiUrl.replace('/api', '');
        profile.profilePicture = baseUrl + profile.profilePicture;
      }
      setProfile(profile);
      setIsFollowing(profile.isFollowing || false);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await getUserPosts(userId);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load posts');
    }
  };

  const handleDeletePost = (postId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This cannot be undone.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await deletePost(postId);
          setPosts(posts.filter(post => post._id !== postId));
          setOpenDropdown(null);
        } catch (error) {
          console.error('Failed to delete post:', error);
        }
      }
    });
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setProfile({ ...profile, followersCount: (profile.followersCount || 1) - 1 });
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setProfile({ ...profile, followersCount: (profile.followersCount || 0) + 1 });
      }
    } catch (error) {
      console.error('Follow error:', error);
      if (error.response?.data?.message?.includes('Already following')) {
        setIsFollowing(true);
      } else if (error.response?.data?.message?.includes('not following')) {
        setIsFollowing(false);
      }
      loadProfile();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    navigate('/messages', { state: { userId, username: profile.username } });
  };

  const handlePhotoUpdate = async (formData) => {
    try {
      const response = await uploadProfilePicture(formData);
      let newPhotoUrl = response.data?.profilePicture || response.profilePicture;
      
      if (newPhotoUrl && newPhotoUrl.startsWith('/uploads/')) {
        const apiUrl = process.env.REACT_APP_API_URL || 'https://radsi-backend.onrender.com/api';
        const baseUrl = apiUrl.replace('/api', '');
        newPhotoUrl = baseUrl + newPhotoUrl;
      }
      
      if (newPhotoUrl) {
        setProfile({ ...profile, profilePicture: newPhotoUrl });
        await loadUser();
        setTimeout(() => { loadProfile(); }, 500);
      }
      
      return response;
    } catch (error) {
      console.error('Photo update error:', error);
      throw error;
    }
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-canvas)]">
        <div className="mini-spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-[var(--text-muted)] font-medium">User not found</p>
        </div>
      </div>
    );
  }

  const handleLike = async (postId, isLiked) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          isLiked: !isLiked,
          likesCount: isLiked ? (post.likesCount - 1) : (post.likesCount + 1)
        };
      }
      return post;
    }));
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (error) {
      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          return { ...post, isLiked, likesCount: isLiked ? (post.likesCount + 1) : (post.likesCount - 1) };
        }
        return post;
      }));
    }
  };

  return (
    <>
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="card-glass-static mb-5 overflow-hidden">
        {/* Cover */}
        <div 
          className="h-48 relative"
          style={profile.coverPhoto 
            ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
            : { background: 'linear-gradient(135deg, rgba(77, 208, 255, 0.2), rgba(124, 245, 210, 0.15), rgba(99, 102, 241, 0.2))' }
          }
        >
          {/* Gradient overlay on cover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)]/80 to-transparent" />
        </div>
        
        <div className="px-5 pb-5 relative">
          {/* Avatar & Actions */}
          <div className="flex items-end justify-between -mt-16 mb-4">
            {isOwnProfile ? (
              <div className="relative z-10">
                <ProfilePhotoUpload 
                  key={profile.profilePicture}
                  currentPhoto={profile.profilePicture}
                  onPhotoUpdate={handlePhotoUpdate}
                />
              </div>
            ) : (
              <div className="relative z-10">
                <Avatar user={profile} size="2xl" clickable={false} showRing={false} className="border-4 border-[var(--bg-canvas)] shadow-xl" />
              </div>
            )}
            
            {!isOwnProfile && (
              <div className="flex gap-2 mb-1">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isFollowing
                      ? 'btn-ghost'
                      : 'btn-accent'
                  } disabled:opacity-50`}
                >
                  {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={handleMessage}
                  className="btn-ghost flex items-center gap-1.5"
                >
                  <FiMail size={16} />
                  Message
                </button>
              </div>
            )}

            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="btn-ghost flex items-center gap-1.5 mb-1"
              >
                <FiSettings size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="mt-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.username}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">@{profile.username}</p>
            
            {profile.bio && (
              <p className="mt-3 text-[15px] text-[var(--text-primary)]/80 leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-3 mt-4">
              <div className="stat-badge">
                <div className="stat-num">{posts.length}</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat-badge cursor-pointer">
                <div className="stat-num">{profile.followersCount || 0}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat-badge cursor-pointer">
                <div className="stat-num">{profile.followingCount || 0}</div>
                <div className="stat-label">Following</div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <FiMapPin size={14} className="text-[var(--accent)]" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1.5">
                  <FiLink size={14} className="text-[var(--accent)]" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <FiCalendar size={14} className="text-[var(--accent)]" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1 mb-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Posts</h3>
          <div className="flex-1 glow-line" />
        </div>
        
        {posts.length === 0 ? (
          <div className="card-glass-static text-center py-16">
            <div className="empty-state-icon">
              <FiImage size={28} />
            </div>
            <p className="text-[var(--text-primary)] font-medium">No posts yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {isOwnProfile ? 'Share something with the world' : `${profile.username} hasn't posted yet`}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="card-glass overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <Link to={`/profile/${profile._id}`} className="flex items-center gap-3">
                  {profile.profilePicture && !profile.profilePicture.includes('ui-avatars.com') ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.username}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--surface-border)]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full ring-2 ring-[var(--surface-border)] flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)]">
                      {getInitials(profile)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--text-primary)]">{profile.username}</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
                {isOwnProfile && (
                  <div className="relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === post._id ? null : post._id)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 hover:bg-white/5 rounded-lg transition"
                    >
                      <FiMoreHorizontal size={18} />
                    </button>
                    
                    {openDropdown === post._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute right-0 mt-1 w-44 dropdown-glass z-20">
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="dropdown-glass-item danger w-full"
                          >
                            <FiTrash2 size={14} />
                            Delete Post
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="px-4 pb-3">
                <p className="text-[var(--text-primary)] text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
              
              {post.images && post.images.length > 0 && (
                <div className="mx-4 mb-3 rounded-xl overflow-hidden">
                  <img
                    src={post.images[0].url}
                    alt="Post"
                    className="w-full max-h-[500px] object-cover"
                  />
                </div>
              )}
              
              <div className="px-4 py-2.5 border-t border-[var(--surface-border)]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post._id, post.isLiked)}
                    className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
                      post.isLiked ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-red-400'
                    }`}
                  >
                    {post.isLiked ? (
                      <FaHeart className="w-4 h-4 text-red-500 animate-like-pop" />
                    ) : (
                      <FiHeart className="w-4 h-4" />
                    )}
                    <span className="font-medium">{post.likesCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition text-sm">
                    <FiMessageCircle className="w-4 h-4" />
                    <span className="font-medium">{post.commentsCount || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    <ConfirmModal
      isOpen={confirmModal.isOpen}
      title={confirmModal.title}
      message={confirmModal.message}
      variant="danger"
      confirmText="Delete"
      onConfirm={confirmModal.onConfirm}
      onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
    />
    </>
  );
};

export default Profile;
