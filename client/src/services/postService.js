import api from './api';

// Get all posts (feed)
export const getPosts = async (page = 1, limit = 10) => {
  const response = await api.get(`/posts?page=${page}&limit=${limit}`);
  return response.data;
};

// Get single post
export const getPost = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

// Create post
export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

// Update post
export const updatePost = async (postId, postData) => {
  const response = await api.put(`/posts/${postId}`, postData);
  return response.data;
};

// Delete post
export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

// Like post
export const likePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};

// Unlike post
export const unlikePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}/unlike`);
  return response.data;
};

// Get user's posts
export const getUserPosts = async (userId, page = 1, limit = 10) => {
  const response = await api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get trending posts
export const getTrendingPosts = async () => {
  const response = await api.get('/posts/trending');
  return response.data;
};
