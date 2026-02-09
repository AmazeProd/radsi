import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, followUser, unfollowUser, uploadProfilePicture } from '../services/userService';
import { getUserPosts, deletePost } from '../services/postService';
import { FiHeart, FiMessageCircle, FiMoreHorizontal, FiMail, FiSettings, FiTrash2, FiMapPin, FiLink, FiCalendar } from 'react-icons/fi';
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-5 overflow-hidden">
        {/* Cover */}
        <div 
          className="h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600"
          style={profile.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        ></div>
        
        <div className="px-5 pb-5">
          {/* Avatar & Actions */}
          <div className="flex items-end justify-between -mt-16 mb-4">
            {isOwnProfile ? (
              <ProfilePhotoUpload 
                key={profile.profilePicture}
                currentPhoto={profile.profilePicture}
                onPhotoUpdate={handlePhotoUpdate}
              />
            ) : (
              <Avatar user={profile} size="2xl" clickable={false} showRing={false} className="border-4 border-white dark:border-gray-900 shadow-md" />
            )}
            
            {!isOwnProfile && (
              <div className="flex gap-2 mb-1">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } disabled:opacity-50`}
                >
                  {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiMail size={16} />
                  Message
                </button>
              </div>
            )}

            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="flex items-center gap-1.5 px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-1"
              >
                <FiSettings size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="mt-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.username}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
            
            {profile.bio && (
              <p className="mt-3 text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900 dark:text-white">{posts.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
              </div>
              <div className="text-center cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <div className="font-bold text-lg text-gray-900 dark:text-white">{profile.followersCount || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
              </div>
              <div className="text-center cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <div className="font-bold text-lg text-gray-900 dark:text-white">{profile.followingCount || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <FiMapPin size={14} className="text-gray-400 dark:text-gray-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1.5">
                  <FiLink size={14} className="text-gray-400 dark:text-gray-500" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <FiCalendar size={14} className="text-gray-400 dark:text-gray-500" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white px-1">Posts</h3>
        
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {isOwnProfile ? 'Share something with the world' : `${profile.username} hasn't posted yet`}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
              <div className="flex items-center justify-between p-4">
                <Link to={`/profile/${profile._id}`} className="flex items-center gap-3">
                  {profile.profilePicture && !profile.profilePicture.includes('ui-avatars.com') ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.username}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-100 dark:ring-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full ring-1 ring-gray-100 dark:ring-gray-700 flex items-center justify-center text-white text-sm font-bold bg-indigo-500">
                      {getInitials(profile)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{profile.username}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
                {isOwnProfile && (
                  <div className="relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === post._id ? null : post._id)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <FiMoreHorizontal size={18} />
                    </button>
                    
                    {openDropdown === post._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition"
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
                <p className="text-gray-800 dark:text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
              
              {post.images && post.images.length > 0 && (
                <div>
                  <img
                    src={post.images[0].url}
                    alt="Post"
                    className="w-full max-h-[500px] object-cover"
                  />
                </div>
              )}
              
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 transition text-sm">
                    <FiHeart className="w-4 h-4" />
                    <span className="font-medium">{post.likesCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-sm">
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
