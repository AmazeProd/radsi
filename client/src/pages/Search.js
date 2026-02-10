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
      <div className="card-glass-static p-4 mb-5">
        <form onSubmit={handleSearch}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input
                type="text"
                placeholder="Search people..."
                value={query}
                onChange={handleInputChange}
                className="input-glass w-full pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-accent px-6 py-2.5 text-sm"
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
        <div className="card-glass-static text-center py-16">
          <div className="empty-state-icon">
            <FiSearch size={28} />
          </div>
          <p className="text-[var(--text-primary)] font-medium">No users found for "{query}"</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Try a different search term</p>
        </div>
      )}

      {/* Recent Searches */}
      {!searched && recentSearches.length > 0 && (
        <div className="card-glass-static p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wider">
              <FiClock size={14} className="text-[var(--accent)]" />
              Recent
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-[var(--text-muted)] hover:text-red-400 font-medium flex items-center gap-1 transition"
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
                className="flex items-center p-2.5 hover:bg-white/5 rounded-xl transition group"
              >
                {user.profilePicture && !user.profilePicture.includes('ui-avatars.com') ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-10 h-10 rounded-full mr-3 ring-2 ring-[var(--surface-border)] object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full mr-3 ring-2 ring-[var(--surface-border)] flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)]">
                    {getInitials(user)}
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">{user.username}</h4>
                  {(user.firstName || user.lastName) && (
                    <p className="text-xs text-[var(--text-muted)]">
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
            <div key={user._id} className="card-glass p-4 group">
              <Link 
                to={`/profile/${user._id}`}
                onClick={() => saveToHistory(user)}
                className="flex items-center"
              >
                {user.profilePicture && !user.profilePicture.includes('ui-avatars.com') ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-12 h-12 rounded-full mr-3.5 ring-2 ring-[var(--surface-border)] object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mr-3.5 ring-2 ring-[var(--surface-border)] flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)]">
                    {getInitials(user)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">{user.username}</h3>
                  {(user.firstName || user.lastName) && (
                    <p className="text-sm text-[var(--text-muted)]">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                  {user.bio && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1 opacity-70">{user.bio}</p>
                  )}
                  <div className="flex gap-4 mt-1.5 text-xs text-[var(--text-muted)]">
                    <span><span className="font-semibold text-[var(--text-primary)]">{user.followersCount || 0}</span> followers</span>
                    <span><span className="font-semibold text-[var(--text-primary)]">{user.followingCount || 0}</span> following</span>
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
