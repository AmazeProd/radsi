import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../services/userService';
import { toast } from 'react-toastify';
import { FiSearch, FiClock, FiX } from 'react-icons/fi';
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

const Search = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Update recent searches when currentUser changes (e.g., profile picture updated)
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        const searches = JSON.parse(saved);
        const updated = searches.map(user => 
          user._id === currentUser._id || user._id === currentUser.id 
            ? { ...user, profilePicture: currentUser.profilePicture }
            : user
        );
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
    }
  }, [currentUser?.profilePicture]);

  const saveToHistory = (user) => {
    // Ensure we save the user with current profile picture
    const userToSave = { ...user };
    const newHistory = [
      userToSave,
      ...recentSearches.filter((u) => u._id !== user._id),
    ].slice(0, 5); // Keep only 5 recent searches
    
    setRecentSearches(newHistory);
    localStorage.setItem('recentSearches', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    toast.success('Search history cleared');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await searchUsers(query);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      setUsers([]);
      setSearched(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for people..."
                value={query}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 font-semibold transition-all transform hover:scale-105"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && searched && users.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="text-gray-300 mb-4">
            <FiSearch size={64} className="mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">No users found matching "{query}"</p>
          <p className="text-sm text-gray-400 mt-1">Try searching with a different term</p>
        </div>
      )}

      {!searched && recentSearches.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiClock size={20} />
              Recent Searches
            </h3>
            <button
              onClick={clearHistory}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <FiX size={16} />
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {recentSearches.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user._id}`}
                className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition group"
              >
                {user.profilePicture && !user.profilePicture.includes('ui-avatars.com') ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-12 h-12 rounded-full mr-3 ring-2 ring-gray-100 group-hover:ring-primary-400 transition object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mr-3 ring-2 ring-gray-100 group-hover:ring-primary-400 transition flex items-center justify-center text-white text-lg font-bold bg-blue-500">
                    {getInitials(user)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">{user.username}</h4>
                  {(user.firstName || user.lastName) && (
                    <p className="text-sm text-gray-500">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all group">
              <Link 
                to={`/profile/${user._id}`}
                onClick={() => saveToHistory(user)}
                className="flex items-center"
              >
                {user.profilePicture && !user.profilePicture.includes('ui-avatars.com') ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-16 h-16 rounded-full mr-4 ring-2 ring-gray-100 group-hover:ring-primary-400 transition object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full mr-4 ring-2 ring-gray-100 group-hover:ring-primary-400 transition flex items-center justify-center text-white text-2xl font-bold bg-blue-500">
                    {getInitials(user)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition">{user.username}</h3>
                  {(user.firstName || user.lastName) && (
                    <p className="text-gray-600">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                  {user.bio && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{user.bio}</p>
                  )}
                  <div className="flex gap-5 mt-2 text-sm">
                    <span className="text-gray-600"><span className="font-semibold text-gray-900">{user.followersCount || 0}</span> followers</span>
                    <span className="text-gray-600"><span className="font-semibold text-gray-900">{user.followingCount || 0}</span> following</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
