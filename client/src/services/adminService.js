import api from './api';

export const getAdminStats = () => api.get('/admin/stats');

export const getAllUsers = () => api.get('/admin/users?status=active&limit=100');

export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

export const permanentDeleteUser = (userId) => api.delete(`/admin/users/${userId}/permanent`);

export const getUserActivity = (userId) => api.get(`/admin/users/${userId}/activity`);
