import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import { FiMail, FiSearch, FiMoreVertical } from 'react-icons/fi';

const ConversationList = ({ 
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
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants?.find(p => p._id !== currentUser._id);
    return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Messages
          </h1>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <FiMoreVertical size={18} />
          </motion.button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full px-6 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <FiMail className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No conversations yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start connecting with your friends
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredConversations.map((conversation, index) => {
              const otherUser = conversation.participants?.find(p => p._id !== currentUser._id);
              if (!otherUser) return null;

              const isSelected = selectedUser?._id === otherUser._id;
              const isOnline = onlineUsers.includes(otherUser._id);
              const hasUnread = conversation.unreadCount > 0;

              return (
                <motion.div
                  key={conversation._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectUser(conversation)}
                  onContextMenu={(e) => onContextMenu(e, conversation)}
                  className={`
                    relative px-6 py-4 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-l-blue-600' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="selectedConversation"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  <div className="relative flex items-start gap-4">
                    {/* Avatar with Online Indicator */}
                    <div className="relative flex-shrink-0">
                      <Avatar user={otherUser} size="lg" clickable={false} />
                      {isOnline && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"
                        >
                          <span className="absolute inset-0 w-full h-full rounded-full bg-green-400 animate-ping opacity-75" />
                        </motion.div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className={`font-semibold truncate ${
                          hasUnread 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {otherUser.username}
                        </h3>
                        {conversation.lastMessage?.createdAt && (
                          <span className={`text-xs flex-shrink-0 ${
                            hasUnread 
                              ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${
                          hasUnread 
                            ? 'text-gray-900 dark:text-white font-medium' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {conversation.lastMessage?.content || '📷 Photo'}
                        </p>
                        
                        {hasUnread && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0"
                          >
                            <span className="min-w-[20px] h-5 px-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
