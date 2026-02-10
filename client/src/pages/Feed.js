import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, createPost, likePost, unlikePost, deletePost } from '../services/postService';
import { FiImage, FiSmile, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { debounce } from '../utils/performance';
import PostCard from '../components/posts/PostCard';
import CelebrationPost from '../components/posts/CelebrationPost';
import ConfirmModal from '../components/common/ConfirmModal';

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
  return 'bg-indigo-500';
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
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [inlineError, setInlineError] = useState('');
  const fileInputRef = useRef(null);
  
  // Better emojis
  const commonEmojis = ['😄', '😂', '🥹', '😍', '🤩', '😎', '🫡', '🤭', '👍', '❤️', '🔥', '✨', '💯', '🙌', '👏', '🎊', '💪', '🌟', '😊', '🫶'];

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    if (inlineError) {
      const timer = setTimeout(() => setInlineError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [inlineError]);

  const loadPosts = useCallback(async () => {
    try {
      const response = await getPosts(1);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedImages.length === 0) {
      setInlineError('Add some text or an image to post');
      return;
    }

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await createPost(formData);
      setPosts([response.data, ...posts]);
      setPostContent('');
      setSelectedImages([]);
      setImagePreviews([]);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to create post:', error);
      setInlineError(error.response?.data?.message || 'Failed to create post');
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
    
    if (selectedImages.length + files.length > 4) {
      setInlineError('Maximum 4 images per post');
      e.target.value = '';
      return;
    }
    
    const validFiles = [];
    const previews = [];
    
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setInlineError(`${file.name} is too large (max 50MB)`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        continue;
      }
      
      validFiles.push(file);
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
    e.target.value = '';
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleCreatePost();
    }
  };

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
        const response = await unlikePost(postId);
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === postId ? { ...post, ...response.data } : post
        ));
      } else {
        const response = await likePost(postId);
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === postId ? { ...post, ...response.data } : post
        ));
      }
    } catch (error) {
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
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-canvas)]">
        <div className="mini-spinner" />
      </div>
    );
  }

  return (
    <>
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
      {/* Create Post */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-5">
        <textarea
          className="w-full p-3 border-0 resize-none focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent text-[15px]"
          rows="3"
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          onKeyDown={handleKeyPress}
        ></textarea>
        
        {inlineError && (
          <div className="mx-1 mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
            <span>{inlineError}</span>
            <button onClick={() => setInlineError('')} className="ml-2 hover:text-red-800 dark:hover:text-red-300">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-1.5">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-110 transition-transform p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {imagePreviews.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden">
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  type="button"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-1">
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
              className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2.5 rounded-lg transition"
              type="button"
              title="Add images"
            >
              <FiImage className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2.5 rounded-lg transition ${showEmojiPicker ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
              type="button"
              title="Add emoji"
            >
              <FiSmile className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleCreatePost}
            disabled={posting || (!postContent.trim() && selectedImages.length === 0)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to share something</p>
          </div>
        )}
        {posts.map((post) => (
          post.isCelebration ? (
            <CelebrationPost
              key={post._id}
              post={post}
              onLike={handleLike}
            />
          ) : (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onDelete={handleDeletePost}
              currentImageIndex={currentImageIndex[post._id] || 0}
              onNextImage={nextImage}
              onPrevImage={prevImage}
            />
          )
        ))}
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

export default Feed;
