import React, { useMemo } from 'react';
import Avatar from '../common/Avatar';
import { FiSearch, FiEdit, FiMessageCircle } from 'react-icons/fi';

const ConversationList = React.memo(({ 
  conversations, 
  selectedUser, 
  onSelectUser, 
  onlineUsers, 
  currentUser,
  onContextMenu,
  searchQuery,
  onSearchChange 
}) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const otherUser = conv.participants?.find(p => p._id !== currentUser._id);
      return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, currentUser._id, searchQuery]);

  return (
    <div className="h-full flex flex-col w-full" style={{ background: 'var(--bg-elevated)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Messages
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium uppercase tracking-wider">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-md shadow-[var(--accent)]/25 hover:shadow-lg hover:brightness-110 transition-all active:scale-95"
          >
            <FiEdit size={15} />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={15} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-glass w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--surface-border)] mx-5" />

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto msg-scrollbar min-h-0 pt-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center py-16">
            <div className="empty-state-icon mx-auto mb-4">
              <FiMessageCircle size={24} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-1">
              {searchQuery ? 'No results found' : 'No conversations'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] opacity-60 max-w-[200px]">
              {searchQuery ? 'Try a different search term' : 'Visit a profile to start chatting'}
            </p>
          </div>
        ) : (
          <div className="px-2.5 pb-2">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.participants?.find(p => p._id !== currentUser._id);
              if (!otherUser) return null;

              const isSelected = selectedUser?._id === otherUser._id;
              const isOnline = onlineUsers.includes(otherUser._id);
              const hasUnread = conversation.unreadCount > 0;
              const lastMsg = conversation.lastMessage;

              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectUser(conversation)}
                  className={`
                    relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-150
                    ${isSelected 
                      ? 'bg-[var(--accent)]/10 shadow-sm' 
                      : 'hover:bg-white/5 active:bg-white/[0.08]'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[var(--accent)] rounded-r-full" />
                  )}

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar user={otherUser} size="md" clickable={false} />
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-[var(--bg-elevated)] rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-[14px] leading-tight truncate ${
                        hasUnread 
                          ? 'font-bold text-[var(--text-primary)]' 
                          : 'font-semibold text-[var(--text-secondary)]'
                      }`}>
                        {otherUser.username}
                      </h3>
                      {lastMsg?.createdAt && (
                        <span className={`text-[11px] flex-shrink-0 tabular-nums ${
                          hasUnread 
                            ? 'text-[var(--accent)] font-semibold' 
                            : 'text-[var(--text-muted)]'
                        }`}>
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-[13px] truncate leading-snug ${
                        hasUnread 
                          ? 'text-[var(--text-secondary)] font-medium' 
                          : 'text-[var(--text-muted)]'
                      }`}>
                        {lastMsg?.image && !lastMsg?.content ? '📷 Photo' : lastMsg?.content || 'Start a conversation'}
                      </p>
                      
                      {hasUnread && (
                        <span className="flex-shrink-0 min-w-[20px] h-[20px] px-1.5 bg-[var(--accent)] text-white text-[11px] font-bold rounded-full inline-flex items-center justify-center shadow-sm shadow-[var(--accent)]/30">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default ConversationList;
