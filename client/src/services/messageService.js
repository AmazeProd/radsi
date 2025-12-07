import api from './api';

// Get all conversations
export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

// Get messages with a specific user
export const getMessages = async (userId) => {
  const response = await api.get(`/messages/${userId}`);
  return response.data;
};

// Send a message
export const sendMessage = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await api.post('/messages', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// Mark messages as read
export const markAsRead = async (userId) => {
  const response = await api.put(`/messages/${userId}/read`);
  return response.data;
};

// Delete a message
export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

// Delete entire conversation with a user
export const deleteConversation = async (userId) => {
  const response = await api.delete(`/messages/conversation/${userId}`);
  return response.data;
};

// Get unread count
export const getUnreadCount = async () => {
  const response = await api.get('/messages/unread/count');
  return response.data;
};
