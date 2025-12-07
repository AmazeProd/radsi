import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, followUser, unfollowUser, uploadProfilePicture } from '../services/userService';
import { getUserPosts, deletePost } from '../services/postService';
import { toast } from 'react-toastify';
import { FiHeart, FiMessageCircle, FiMoreHorizontal, FiMail, FiSettings, FiTrash2 } from 'react-icons/fi';
import ProfilePhotoUpload from '../components/profile/ProfilePhotoUpload';

const getInitials = (profile) => {
  if (profile.firstName && profile.firstName.trim() && profile.lastName && profile.lastName.trim()) {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  }
  if (profile.firstName && profile.firstName.trim()) {
    return profile.firstName.charAt(0).toUpperCase();
  }
  if (profile.username && profile.username.trim()) {
    return profile.username.charAt(0).toUpperCase();
  }
  return 'U';
};

const getAvatarColor = (str) => {
  return 'bg-blue-500';
};

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Check if viewing own profile - compare as strings to handle both _id and id
  const isOwnProfile = currentUser && userId && (
    currentUser._id === userId || 
    currentUser.id === userId || 
    currentUser._id?.toString() === userId || 
    currentUser.id?.toString() === userId
  );

  useEffect(() => {
    loadProfile();
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await getUserProfile(userId);
      console.log('Profile data:', response.data);
      console.log('Profile picture:', response.data.profilePicture);
      console.log('Username:', response.data.username);
      console.log('First name:', response.data.firstName);
      console.log('Last name:', response.data.lastName);
      setProfile(response.data);
      setIsFollowing(response.data.isFollowing || false);
    } catch (error) {
      toast.error('Failed to load profile');
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

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      setOpenDropdown(null);
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
    }
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
      console.error('Error response:', error.response?.data);
      
      // Handle "already following" error by syncing state
      if (error.response?.data?.message?.includes('Already following')) {
        setIsFollowing(true);
        toast.info('You are already following this user');
      } else if (error.response?.data?.message?.includes('not following')) {
        setIsFollowing(false);
        toast.info('You are not following this user');
      } else {
        const message = error.response?.data?.message || 'Failed to update follow status';
        toast.error(message);
      }
      
      // Reload profile to sync state
      loadProfile();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    navigate('/messages', { state: { userId, username: profile.username } });
  };

  const handlePhotoUpdate = async (formData) => {
    const response = await uploadProfilePicture(formData);
    // Update profile state with new photo
    setProfile({ ...profile, profilePicture: response.data.profilePicture });
    // Update auth context if needed
    if (currentUser) {
      currentUser.profilePicture = response.data.profilePicture;
    }
    return response;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden animate-fadeInScale">
        {/* Cover Photo */}
        <div 
          className="h-56 bg-gradient-to-br from-github-blue via-purple-600 to-pink-600"
          style={profile.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        ></div>
        
        <div className="px-6 pb-6">
          {/* Profile Picture and Actions */}
          <div className="flex items-end justify-between -mt-20 mb-4">
            {isOwnProfile ? (
              <ProfilePhotoUpload 
                currentPhoto={profile.profilePicture}
                onPhotoUpdate={handlePhotoUpdate}
              />
            ) : (
              profile.profilePicture && !profile.profilePicture.includes('ui-avatars.com') ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold ${getAvatarColor(profile.username)}`}>
                  {getInitials(profile)}
                </div>
              )
            )}
            
            {!isOwnProfile && (
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                  } disabled:opacity-50`}
                >
                  {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all transform hover:scale-105"
                >
                  <FiMail size={18} />
                  Message
                </button>
              </div>
            )}

            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all mb-2"
              >
                <FiSettings size={18} />
                Edit Profile
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.username}
            </h2>
            <p className="text-gray-500 font-medium">@{profile.username}</p>
            
            {profile.bio && (
              <p className="mt-3 text-gray-700 leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-8 mt-5 text-sm">
              <div className="text-center transform hover:scale-110 transition-transform animate-fadeIn">
                <div className="font-bold text-xl text-gray-900">{posts.length}</div>
                <div className="text-gray-500">Posts</div>
              </div>
              <div className="text-center cursor-pointer hover:text-primary-600 transition transform hover:scale-110 transition-transform animate-fadeIn delay-100">
                <div className="font-bold text-xl text-gray-900">{profile.followersCount || 0}</div>
                <div className="text-gray-500">Followers</div>
              </div>
              <div className="text-center cursor-pointer hover:text-primary-600 transition transform hover:scale-110 transition-transform animate-fadeIn delay-200">
                <div className="font-bold text-xl text-gray-900">{profile.followingCount || 0}</div>
                <div className="text-gray-500">Following</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-sm text-gray-600 space-y-2">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2">
                  <span>🔗</span>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 px-1">Posts</h3>
        
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 animate-fadeIn">
            <div className="text-gray-300 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No posts yet</p>
            <p className="text-sm text-gray-400 mt-1">When {isOwnProfile ? 'you post' : `${profile.username} posts`}, they'll appear here</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all transform hover:scale-[1.02] animate-slideInFromBottom">
              <div className="flex items-center justify-between p-4">
                <Link to={`/profile/${profile._id}`} className="flex items-center gap-3">
                  {profile.profilePicture && !profile.profilePicture.includes('ui-avatars.com') ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.username}
                      className="w-11 h-11 rounded-full ring-2 ring-gray-100 object-cover"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-full ring-2 ring-gray-100 flex items-center justify-center text-white text-lg font-bold ${getAvatarColor(profile.username)}`}>
                      {getInitials(profile)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile.username}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
                {isOwnProfile && (
                  <div className="relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === post._id ? null : post._id)}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <FiMoreHorizontal size={20} />
                    </button>
                    
                    {openDropdown === post._id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenDropdown(null)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                          >
                            <FiTrash2 size={16} />
                            Delete Post
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="px-4 pb-3">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
              
              {post.images && post.images.length > 0 && (
                <div className="px-0">
                  <img
                    src={post.images[0].url}
                    alt="Post"
                    className="w-full max-h-[500px] object-cover"
                  />
                </div>
              )}
              
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex items-center gap-5">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition group">
                    <FiHeart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{post.likesCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition group">
                    <FiMessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{post.commentsCount || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
