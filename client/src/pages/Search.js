import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../services/userService';
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
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

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
    const userToSave = { ...user };
    const newHistory = [
      userToSave,
      ...recentSearches.filter((u) => u._id !== user._id),
    ].slice(0, 5);
    
    setRecentSearches(newHistory);
    localStorage.setItem('recentSearches', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await searchUsers(query);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-5">
        <form onSubmit={handleSearch}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search people..."
                value={query}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="mini-spinner" />
        </div>
      )}

      {/* No Results */}
      {!loading && searched && users.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <FiSearch size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No users found for "{query}"</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
        </div>
      )}

      {/* Recent Searches */}
      {!searched && recentSearches.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiClock size={16} className="text-gray-400 dark:text-gray-500" />
              Recent Searches
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium flex items-center gap-1 transition"
            >
              <FiX size={14} />
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {recentSearches.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user._id}`}
                className="flex items-center p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition group"
              >
                {user.profilePicture && !user.profilePicture.includes('ui-avatars.com') ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-10 h-10 rounded-full mr-3 ring-1 ring-gray-100 dark:ring-gray-700 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full mr-3 ring-1 ring-gray-100 dark:ring-gray-700 flex items-center justify-center text-white text-sm font-bold bg-indigo-500">
                    {getInitials(user)}
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{user.username}</h4>
                  {(user.firstName || user.lastName) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {!loading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition group">
              <Link 
                to={`/profile/${user._id}`}
                onClick={() => saveToHistory(user)}
                className="flex items-center"
              >
                {user.profilePicture && !user.profilePicture.includes('ui-avatars.com') ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-12 h-12 rounded-full mr-3.5 ring-1 ring-gray-100 dark:ring-gray-700 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mr-3.5 ring-1 ring-gray-100 dark:ring-gray-700 flex items-center justify-center text-white text-lg font-bold bg-indigo-500">
                    {getInitials(user)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{user.username}</h3>
                  {(user.firstName || user.lastName) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                  {user.bio && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{user.bio}</p>
                  )}
                  <div className="flex gap-4 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span><span className="font-semibold text-gray-700 dark:text-gray-300">{user.followersCount || 0}</span> followers</span>
                    <span><span className="font-semibold text-gray-700 dark:text-gray-300">{user.followingCount || 0}</span> following</span>
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
