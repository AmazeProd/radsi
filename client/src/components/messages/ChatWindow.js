import React, { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiMoreVertical, 
  FiTrash2, 
  FiPhone, 
  FiVideo,
  FiInfo 
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
  const isInitialLoad = useRef(true);
  const prevSelectedUserRef = useRef(null);

  useEffect(() => {
    // Instant scroll on user change, smooth scroll on new messages
    const userChanged = prevSelectedUserRef.current !== selectedUser?._id;
    
    if (userChanged) {
      prevSelectedUserRef.current = selectedUser?._id;
      isInitialLoad.current = true;
      scrollToBottom(true); // Instant scroll
    } else if (messages.length > 0) {
      scrollToBottom(false); // Smooth scroll for new messages
    }
  }, [messages, selectedUser?._id]);

  const scrollToBottom = (instant = false) => {
    requestAnimationFrame(() => {
      if (messagesContainerRef.current && isInitialLoad.current) {
        // Instant scroll to bottom for initial load
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        isInitialLoad.current = false;
      } else {
        // Smooth scroll for new messages
        messagesEndRef.current?.scrollIntoView({ 
          behavior: instant ? 'auto' : 'smooth', 
          block: 'end' 
        });
      }
    });
  };

  const formatLastSeen = (lastSeenTime) => {
    if (!lastSeenTime) return 'Offline';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeenTime);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    
    return `Last seen ${lastSeenDate.toLocaleDateString()}`;
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Select a conversation
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Choose from your existing conversations or start a new one
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Back Button - Mobile */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </motion.button>

          {/* User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <Avatar user={selectedUser} size="md" clickable={false} />
              {isOnline && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {selectedUser.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {isOnline ? (
                  <span className="text-green-600 dark:text-green-400">Active now</span>
                ) : (
                  formatLastSeen(lastSeen)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            title="Audio call"
          >
            <FiPhone size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            title="Video call"
          >
            <FiVideo size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            title="Info"
          >
            <FiInfo size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDeleteConversation}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
            title="Delete conversation"
          >
            <FiTrash2 size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)
          `
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start the conversation with {selectedUser.username}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((message, index) => {
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
                />
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

export default ChatWindow;
