import api from './api';

// Get user profile
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

// Delete user account
export const deleteUserAccount = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Upload avatar
export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post(`/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload profile picture (for current user)
export const uploadProfilePicture = async (formData) => {
  const response = await api.post('/users/me/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload cover photo
export const uploadCoverPhoto = async (userId, file) => {
  const formData = new FormData();
  formData.append('cover', file);
  const response = await api.post(`/users/${userId}/cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Search users
export const searchUsers = async (query, page = 1, limit = 20) => {
  const response = await api.get(`/users/search?query=${query}&page=${page}&limit=${limit}`);
  return response.data;
};

// Follow user
export const followUser = async (userId) => {
  const response = await api.post(`/users/${userId}/follow`);
  return response.data;
};

// Unfollow user
export const unfollowUser = async (userId) => {
  const response = await api.delete(`/users/${userId}/unfollow`);
  return response.data;
};

// Get followers
export const getFollowers = async (userId) => {
  const response = await api.get(`/users/${userId}/followers`);
  return response.data;
};

// Get following
export const getFollowing = async (userId) => {
  const response = await api.get(`/users/${userId}/following`);
  return response.data;
};

// Update current user profile
export const updateProfile = async (userData) => {
  const response = await api.put('/users/me', userData);
  return response.data;
};
