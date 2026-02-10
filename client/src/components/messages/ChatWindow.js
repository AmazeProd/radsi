import React, { useEffect, useRef, memo, useState, useMemo } from 'react';
import { 
  FiArrowLeft, 
  FiTrash2, 
  FiPhone, 
  FiVideo,
  FiMoreHorizontal,
  FiMessageCircle
} from 'react-icons/fi';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';

const ChatWindow = memo(({ 
  selectedUser, 
  messages, 
  onBack, 
  onDeleteMessage,
  onDeleteConversation,
  isOnline,
  lastSeen,
  currentUser,
  isLoading 
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevSelectedUserRef = useRef(null);
  const prevMsgCountRef = useRef(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // Reset animation flag when switching users
  useEffect(() => {
    prevSelectedUserRef.current = selectedUser?._id;
    setInitialLoadDone(false);
    prevMsgCountRef.current = 0;
    // After messages render, enable animations for future messages
    const timer = requestAnimationFrame(() => setInitialLoadDone(true));
    return () => cancelAnimationFrame(timer);
  }, [selectedUser?._id]);

  // Smooth scroll only for NEW messages after initial load
  useEffect(() => {
    if (!initialLoadDone) return;
    if (messages.length > prevMsgCountRef.current && prevMsgCountRef.current > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, initialLoadDone]);

  // Close header menu on outside click
  useEffect(() => {
    if (!showHeaderMenu) return;
    const close = () => setShowHeaderMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showHeaderMenu]);

  const formatLastSeen = (lastSeenTime) => {
    if (!lastSeenTime) return 'Offline';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeenTime);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return lastSeenDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    if (!messages.length) return [];
    
    const groups = [];
    let currentDate = null;
    
    messages.forEach((message) => {
      const msgDate = new Date(message.createdAt);
      const dateKey = msgDate.toDateString();
      
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        const now = new Date();
        const isToday = msgDate.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = msgDate.toDateString() === yesterday.toDateString();
        
        let label;
        if (isToday) label = 'Today';
        else if (isYesterday) label = 'Yesterday';
        else label = msgDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        
        groups.push({ type: 'date', label, key: `date-${dateKey}` });
      }
      
      groups.push({ type: 'message', data: message, key: message._id });
    });
    
    return groups;
  }, [messages]);

  // Empty state - no user selected
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ background: 'var(--bg-canvas)' }}>
        <div className="text-center max-w-xs">
          <div className="empty-state-icon mx-auto mb-5">
            <FiMessageCircle size={32} />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Your messages
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
      {/* Chat Header */}
      <div className="flex-shrink-0 px-4 sm:px-5 h-[64px] border-b border-[var(--surface-border)] flex items-center justify-between" style={{ background: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Back Button - Mobile */}
          <button
            onClick={onBack}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
          >
            <FiArrowLeft size={18} className="text-[var(--text-muted)]" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <Avatar user={selectedUser} size="sm" clickable={false} />
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[var(--bg-elevated)] rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)] truncate leading-tight">
                {selectedUser.username}
              </h3>
              <p className="text-[12px] text-[var(--text-muted)] truncate leading-tight mt-0.5">
                {isOnline ? (
                  <span className="text-emerald-400 font-medium">Online</span>
                ) : (
                  formatLastSeen(lastSeen)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Audio call"
          >
            <FiPhone size={16} />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Video call"
          >
            <FiVideo size={16} />
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowHeaderMenu(!showHeaderMenu); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <FiMoreHorizontal size={16} />
            </button>
            {/* Dropdown */}
            {showHeaderMenu && (
              <div className="dropdown-glass absolute right-0 top-11 w-48 z-50">
                <button
                  onClick={() => { setShowHeaderMenu(false); onDeleteConversation(); }}
                  className="dropdown-glass-item w-full flex items-center gap-2.5 text-red-400 hover:bg-red-500/10"
                >
                  <FiTrash2 size={15} />
                  Delete conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area — column-reverse anchors scroll to bottom natively */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden msg-scrollbar flex flex-col-reverse"
      >
        <div className="px-4 sm:px-6 py-4 space-y-1 max-w-3xl mx-auto w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-[var(--text-muted)]">
                <div className="mini-spinner" />
                <span className="text-sm font-medium">Loading messages...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                <span className="text-2xl">👋</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                Start the conversation
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Say hello to {selectedUser.username}
              </p>
            </div>
          ) : (
            <>
              {groupedMessages.map((item) => {
                if (item.type === 'date') {
                  return (
                    <div key={item.key} className="flex items-center justify-center py-3">
                      <span className="px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--surface-border)] rounded-full shadow-sm uppercase tracking-wider">
                        {item.label}
                      </span>
                    </div>
                  );
                }
                
                const message = item.data;
                const senderId = message.sender?._id || message.sender;
                const isSent = senderId === currentUser._id || senderId === currentUser.id;
                
                return (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isSent={isSent}
                    isRead={message.isRead || message.read}
                    onDelete={onDeleteMessage}
                    currentUser={currentUser}
                    skipAnimation={!initialLoadDone}
                  />
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
});

export default ChatWindow;
