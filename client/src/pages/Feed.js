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
          post._id === postId ? { ...post, ...response.data, isLiked: false } : post
        ));
      } else {
        const response = await likePost(postId);
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === postId ? { ...post, ...response.data, isLiked: true } : post
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="mini-spinner" />
      </div>
    );
  }

  return (
    <>
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
      {/* Create Post */}
      <div className="card-glass-static p-4 mb-5">
        <div className="flex items-start gap-3">
          {user && (
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] flex items-center justify-center text-[#07101f] text-sm font-bold shadow-lg shadow-[var(--accent)]/20">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          )}
          <div className="flex-1">
            <textarea
              className="w-full p-2 border-0 resize-none focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 bg-transparent text-[15px] leading-relaxed"
              rows="3"
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              onKeyDown={handleKeyPress}
            ></textarea>
          </div>
        </div>
        
        {inlineError && (
          <div className="mx-1 mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center justify-between">
            <span>{inlineError}</span>
            <button onClick={() => setInlineError('')} className="ml-2 hover:text-red-300">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-white/[0.03] rounded-xl border border-[var(--surface-border)]">
            <div className="flex flex-wrap gap-1.5">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-white/5"
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
              <div key={index} className="relative group rounded-xl overflow-hidden border border-[var(--surface-border)]">
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 backdrop-blur-sm"
                  type="button"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-[var(--surface-border)]">
          <div className="flex gap-0.5">
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
              className="text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 p-2.5 rounded-xl transition-all"
              type="button"
              title="Add images"
            >
              <FiImage className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2.5 rounded-xl transition-all ${showEmojiPicker ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10'}`}
              type="button"
              title="Add emoji"
            >
              <FiSmile className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleCreatePost}
            disabled={posting || (!postContent.trim() && selectedImages.length === 0)}
            className="btn-accent px-6 py-2 text-sm"
          >
            {posting ? (
              <span className="flex items-center gap-2">
                <span className="mini-spinner" style={{width: '14px', height: '14px', borderWidth: '2px'}} />
                Posting
              </span>
            ) : 'Post'}
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="card-glass-static text-center py-16">
            <div className="empty-state-icon">
              <FiImage className="w-7 h-7" />
            </div>
            <p className="text-[var(--text-primary)] font-medium">No posts yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Be the first to share something</p>
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
