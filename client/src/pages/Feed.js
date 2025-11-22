import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, createPost, likePost, unlikePost } from '../services/postService';
import { toast } from 'react-toastify';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal, FiImage, FiSmile } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

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
  return 'bg-blue-500';
};

const Feed = () => {
  // const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  
  // Common emojis for quick access
  const commonEmojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🎉', '🔥', '✨', '💯', '🙌', '👏', '🎊', '💪', '🌟', '😊', '🤗', '😅'];

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPosts = async () => {
    try {
      const response = await getPosts(1);
      console.log('Full response:', response);
      console.log('Loaded posts:', response.data.map(p => ({ id: p._id, isLiked: p.isLiked, likesCount: p.likesCount })));
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    setPosting(true);
    try {
      const response = await createPost({ content: postContent });
      setPosts([response.data, ...posts]);
      setPostContent('');
      setShowEmojiPicker(false);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setPostContent(postContent + emoji);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      toast.info('Image upload feature will be available soon!');
      // Image upload functionality can be implemented here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleCreatePost();
    }
  };

  const handleLike = async (postId, isLiked) => {
    // Optimistically update UI first
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
        const response = await unlikePost(postId);
        // Update with server response
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === postId ? { ...post, ...response.data } : post
        ));
      } else {
        const response = await likePost(postId);
        // Update with server response
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === postId ? { ...post, ...response.data } : post
        ));
      }
    } catch (error) {
      // Revert on error
      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            isLiked: isLiked,
            likesCount: isLiked ? (post.likesCount + 1) : (post.likesCount - 1)
          };
        }
        return post;
      }));
      console.error('Like error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update like');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Create Post Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow">
        <textarea
          className="w-full p-3 border-0 resize-none focus:outline-none text-gray-800 placeholder-gray-400"
          rows="3"
          placeholder="What's happening?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          onKeyDown={handleKeyPress}
        ></textarea>
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1"
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button 
              onClick={handleImageClick}
              className="text-primary-500 hover:bg-primary-50 p-2 rounded-full transition"
              title="Add image"
              type="button"
            >
              <FiImage className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`${showEmojiPicker ? 'bg-primary-50 text-primary-600' : 'text-primary-500'} hover:bg-primary-50 p-2 rounded-full transition`}
              title="Add emoji"
              type="button"
            >
              <FiSmile className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleCreatePost}
            disabled={posting || !postContent.trim()}
            className="bg-primary-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all transform hover:scale-[1.01]">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <Link to={`/profile/${post.user._id}`} className="flex items-center gap-3">
                {post.user.profilePicture && !post.user.profilePicture.includes('ui-avatars.com') ? (
                  <img
                    src={post.user.profilePicture}
                    alt={post.user.username}
                    className="w-11 h-11 rounded-full ring-2 ring-gray-100 hover:ring-primary-400 transition object-cover"
                  />
                ) : (
                  <div className={`w-11 h-11 rounded-full ring-2 ring-gray-100 hover:ring-primary-400 transition flex items-center justify-center text-white text-lg font-bold ${getAvatarColor(post.user.username)}`}>
                    {getInitials(post.user)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition">{post.user.username}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </Link>
              <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition">
                <FiMoreHorizontal size={20} />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Image */}
            {post.images && post.images.length > 0 && (
              <div className="px-0">
                <img
                  src={post.images[0].url}
                  alt="Post"
                  className="w-full max-h-[500px] object-cover"
                />
              </div>
            )}

            {/* Post Actions */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => handleLike(post._id, post.isLiked)}
                    className={`flex items-center gap-2 transition group ${post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                  >
                    <FiHeart className={`w-6 h-6 group-hover:scale-110 transition-all ${post.isLiked ? 'fill-red-500' : 'group-hover:fill-red-500'}`} />
                    <span className="text-sm font-medium">{post.likesCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition group">
                    <FiMessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{post.commentsCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition group">
                    <FiSend className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <button className="text-gray-600 hover:text-yellow-500 transition">
                  <FiBookmark className="w-6 h-6 hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
