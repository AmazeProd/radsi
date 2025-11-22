import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers, deleteUser } from '../../services/adminService';
import { toast } from 'react-toastify';
import { FiUsers, FiFileText, FiActivity, FiTrendingUp, FiTrash2, FiSearch } from 'react-icons/fi';

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

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeUsers: 0,
    newUsersThisWeek: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        getAdminStats(),
        getAllUsers()
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await deleteUser(userId);
        toast.success(`User "${username}" deleted successfully`);
        loadDashboardData(); // Reload data
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-100 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <FiUsers className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-100 text-sm font-medium">Total Posts</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalPosts}</p>
            </div>
            <FiFileText className="w-12 h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-purple-100 text-sm font-medium">Active Users</h3>
              <p className="text-3xl font-bold mt-2">{stats.activeUsers}</p>
            </div>
            <FiActivity className="w-12 h-12 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-orange-100 text-sm font-medium">New This Week</h3>
              <p className="text-3xl font-bold mt-2">{stats.newUsersThisWeek}</p>
            </div>
            <FiTrendingUp className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Posts</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.profilePicture && !user.profilePicture.includes('ui-avatars.com') ? (
                          <img
                            src={user.profilePicture}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {getInitials(user)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{user.username}</p>
                          {(user.firstName || user.lastName) && (
                            <p className="text-sm text-gray-500">{user.firstName} {user.lastName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.postsCount || 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.username)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Delete user"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
