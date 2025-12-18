import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, createPost, likePost, unlikePost, deletePost } from '../services/postService';
import { toast } from 'react-toastify';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal, FiImage, FiSmile, FiX, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { debounce } from '../utils/performance';

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
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // Track current image index for each post
  const [openDropdown, setOpenDropdown] = useState(null);
  const fileInputRef = useRef(null);
  
  // Common emojis for quick access
  const commonEmojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🎉', '🔥', '✨', '💯', '🙌', '👏', '🎊', '💪', '🌟', '😊', '🤗', '😅'];

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const loadPosts = useCallback(async () => {
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
  }, []);

  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedImages.length === 0) {
      toast.error('Post must contain text or images');
      return;
    }

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      
      // Append all selected images
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      console.log('Creating post with:');
      console.log('- Content:', postContent);
      console.log('- Images:', selectedImages);
      console.log('- FormData entries:', Array.from(formData.entries()));

      const response = await createPost(formData);
      console.log('Post created:', response);
      setPosts([response.data, ...posts]);
      setPostContent('');
      setSelectedImages([]);
      setImagePreviews([]);
      setShowEmojiPicker(false);
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
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
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Limit to 4 images
    if (selectedImages.length + files.length > 4) {
      toast.error('You can only upload up to 4 images per post');
      e.target.value = ''; // Reset input
      return;
    }
    
    // Validate files
    const validFiles = [];
    const previews = [];
    
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 50MB`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      
      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target.result);
        if (previews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    setSelectedImages([...selectedImages, ...validFiles]);
    e.target.value = ''; // Reset input to allow re-selecting same files
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const nextImage = (postId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (postId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
      {/* Create Post Card */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-4 hover:shadow-md transition-all">
        <textarea
          className="w-full p-3 border-0 resize-none focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
          rows="3"
          placeholder="What's happening?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          onKeyDown={handleKeyPress}
        ></textarea>
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        
        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  type="button"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={handleImageClick}
              className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 p-2 rounded-full transition"
              type="button"
              title="Add images"
            >
              <FiImage className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 p-2 rounded-full transition"
              type="button"
              title="Add emoji"
            >
              <FiSmile className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleCreatePost}
            disabled={posting || (!postContent.trim() && selectedImages.length === 0)}
            className="bg-primary-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={post._id} className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all transform hover:scale-[1.01]">
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
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition">{post.user.username}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </Link>
              <div className="relative dropdown-container">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === post._id ? null : post._id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                >
                  <FiMoreHorizontal size={20} />
                </button>
                
                {openDropdown === post._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-10">
                    {user && (user._id === post.user._id || user.id === post.user._id) && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition"
                      >
                        <FiTrash2 size={16} />
                        Delete Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className="px-4 mb-3">
                {post.images.length === 1 ? (
                  <img
                    src={post.images[0].url}
                    alt="Post"
                    className="w-full max-h-[500px] object-cover rounded-lg cursor-pointer hover:opacity-95 transition"
                    onClick={() => window.open(post.images[0].url, '_blank')}
                  />
                ) : (
                  <div className="relative">
                    {/* Image Carousel */}
                    <div className="relative overflow-hidden rounded-lg group">
                      <img
                        src={post.images[currentImageIndex[post._id] || 0].url}
                        alt={`Post ${(currentImageIndex[post._id] || 0) + 1}`}
                        className="w-full max-h-[500px] object-cover cursor-pointer transition-opacity duration-300"
                        onClick={() => window.open(post.images[currentImageIndex[post._id] || 0].url, '_blank')}
                      />
                      
                      {/* Image Counter */}
                      <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {(currentImageIndex[post._id] || 0) + 1} / {post.images.length}
                      </div>
                      
                      {/* Navigation Buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage(post._id, post.images.length);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110"
                        aria-label="Previous image"
                      >
                        <FiChevronLeft size={24} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage(post._id, post.images.length);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110"
                        aria-label="Next image"
                      >
                        <FiChevronRight size={24} />
                      </button>
                    </div>
                    
                    {/* Dot Indicators */}
                    <div className="flex justify-center gap-1.5 mt-3">
                      {post.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(prev => ({ ...prev, [post._id]: idx }))}
                          className={`h-2 rounded-full transition-all ${
                            (currentImageIndex[post._id] || 0) === idx
                              ? 'w-6 bg-primary-600'
                              : 'w-2 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Post Actions */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => handleLike(post._id, post.isLiked)}
                    className={`flex items-center gap-2 transition group ${post.isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-red-500'}`}
                  >
                    <FiHeart className={`w-6 h-6 group-hover:scale-110 transition-all ${post.isLiked ? 'fill-red-500' : 'group-hover:fill-red-500'}`} />
                    <span className="text-sm font-medium">{post.likesCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition group">
                    <FiMessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{post.commentsCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition group">
                    <FiSend className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <button className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition">
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
