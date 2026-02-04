import api from './api';

// Add reaction to a post
export const addReaction = async (postId, emoji) => {
  try {
    const response = await api.post(`/posts/${postId}/reactions`, { emoji });
    return response.data;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

// Remove reaction from a post
export const removeReaction = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}/reactions`);
    return response.data;
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
};

// Get post by ID
export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

export { getPosts, createPost, deletePost, likePost, unlikePost } from './postService';
