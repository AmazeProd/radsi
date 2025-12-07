import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getConversations, getMessages, sendMessage, markAsRead, deleteConversation } from '../services/messageService';
import { getUserProfile } from '../services/userService';
import { toast } from 'react-toastify';
import { FiMail, FiMessageCircle, FiImage, FiX } from 'react-icons/fi';
import { debounce } from '../utils/performance';

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

const getAvatarColor = (str) => {
  return 'bg-blue-500';
};;

// Helper function to format last seen time
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'Offline';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMs = now - lastSeenDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Format exact time
  const timeString = lastSeenDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago at ${timeString}`;
  if (diffDays === 1) return `yesterday at ${timeString}`;
  if (diffDays < 7) return `${diffDays}d ago at ${timeString}`;
  
  const dateString = lastSeenDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  return `${dateString} at ${timeString}`;
};

const Messages = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { socket, onlineUsers, userStatus } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversationPage, setConversationPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesCacheRef = useRef(new Map()); // Cache messages by userId
  const fileInputRef = useRef(null);
  // const pollIntervalRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🎉', '🔥', '✨', '💯', '🙌', '👏', '🎊', '💪', '🌟', '😊', '🤗', '😅', '😢', '😭', '😡', '🤣', '😜', '😇', '🥳', '😴', '🤩', '😱'];

  // Force re-render when online users change
  useEffect(() => {
    // Trigger re-render for online status
  }, [onlineUsers, userStatus]);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
      
      // When tab becomes visible and user is viewing a chat, mark messages as read
      if (!document.hidden && selectedUser) {
        markAsRead(selectedUser._id).catch(err => console.error('Failed to mark as read:', err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedUser]);

  useEffect(() => {
    loadConversations();

    // If coming from profile page with user info
    if (location.state?.userId) {
      loadUserProfile(location.state.userId);
    }
  }, [location.state, onlineUsers, userStatus]);

  const loadUserProfile = async (userId) => {
    try {
      const response = await getUserProfile(userId);
      const userData = response.data;
      const userInfo = {
        _id: userData._id,
        username: userData.username,
        profilePicture: userData.profilePicture,
        isOnline: onlineUsers.includes(userData._id),
        lastSeen: userData.lastSeen || userStatus.get(userData._id)?.lastSeen || null,
      };
      setSelectedUser(userInfo);
      loadMessages(userId);
    } catch (error) {
      console.error('Failed to load user profile');
    }
  };

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (message) => {
        console.log('Received message via socket:', message._id, message.content);
        
        // Always refresh conversation list when a new message arrives
        loadConversations();
        
        // Update cache for this conversation
        const conversationUserId = message.sender._id === user._id ? message.receiver._id : message.sender._id;
        if (messagesCacheRef.current.has(conversationUserId)) {
          const cachedMessages = messagesCacheRef.current.get(conversationUserId);
          const messageExists = cachedMessages.some(m => m._id === message._id);
          if (!messageExists) {
            messagesCacheRef.current.set(conversationUserId, [...cachedMessages, message]);
          }
        }
        
        // If we're viewing this conversation, add message to the list
        if (selectedUser) {
          const isRelevant = 
            (message.sender?._id === selectedUser._id && message.receiver?._id === user._id) ||
            (message.sender?._id === user._id && message.receiver?._id === selectedUser._id);
          
          if (isRelevant) {
            setMessages((prev) => {
              // Check if message already exists by ID
              const existsById = prev.some(m => m._id === message._id);
              if (existsById) {
                console.log('Message already exists, skipping:', message._id);
                return prev;
              }
              
              // Check for temporary message to replace
              const tempIndex = prev.findIndex(m => 
                m._id.startsWith('temp-') && 
                m.content === message.content &&
                m.sender._id === message.sender._id &&
                Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 5000
              );
              
              if (tempIndex !== -1) {
                // Replace temp message with real one
                console.log('Replacing temp message with real one:', message._id);
                const newMessages = [...prev];
                newMessages[tempIndex] = message;
                return newMessages;
              }
              
              // Add new message
              console.log('Adding new message:', message._id);
              return [...prev, message];
            });
            scrollToBottom();
            
            // If this is a message TO me and tab is visible, mark as read immediately
            if (message.receiver?._id === user._id && isTabVisible && !document.hidden) {
              markAsRead(selectedUser._id).catch(err => console.error('Failed to mark as read:', err));
            }
          }
        }
      };

      const handleMessagesRead = (data) => {
        console.log('Received messages-read event:', data);
        // Update messages to show as read when the receiver confirms they read them
        const currentUserId = user._id || user.id;
        console.log('Current user:', currentUserId, 'Sender in event:', data.senderId);
        
        // If I am the sender of the messages that were just read
        if (data.senderId === currentUserId) {
          console.log('Updating my messages to read status');
          setMessages((prev) => {
            const updated = prev.map((msg) => {
              const msgSender = msg.sender?._id || msg.sender;
              if (msgSender === currentUserId) {
                console.log('Marking message as read:', msg._id);
                return { ...msg, isRead: true, readAt: new Date() };
              }
              return msg;
            });
            return updated;
          });
        }
      };

      socket.on('receive-message', handleReceiveMessage);
      socket.on('messages-read', handleMessagesRead);

      return () => {
        socket.off('receive-message', handleReceiveMessage);
        socket.off('messages-read', handleMessagesRead);
      };
    }
  }, [socket, selectedUser, user, isTabVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update selectedUser status when online/offline status changes
  useEffect(() => {
    if (selectedUser) {
      const isOnline = onlineUsers.includes(selectedUser._id);
      const status = userStatus.get(selectedUser._id);
      
      setSelectedUser(prev => {
        // Only update if values actually changed
        if (prev.isOnline !== isOnline || prev.lastSeen !== status?.lastSeen) {
          return {
            ...prev,
            isOnline: isOnline,
            lastSeen: status?.lastSeen || prev.lastSeen,
          };
        }
        return prev;
      });
    }
  }, [onlineUsers, userStatus, selectedUser?._id]);

  const scrollToBottom = () => {
    // Use requestAnimationFrame for smoother scroll
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    });
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(newMessage + emoji);
  };

  const loadConversations = async (page = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      
      const response = await getConversations();
      const allConversations = response.data || [];
      
      // Sort conversations by most recent message first
      const sortedConversations = allConversations.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt || a.updatedAt || a.createdAt || 0;
        const dateB = b.lastMessage?.createdAt || b.updatedAt || b.createdAt || 0;
        return new Date(dateB) - new Date(dateA); // Newest first
      });
      
      // Client-side pagination
      const limit = 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedConversations = sortedConversations.slice(0, endIndex);
      
      setConversations(paginatedConversations);
      setHasMoreConversations(endIndex < sortedConversations.length);
      setConversationPage(page);
      
      // Prefetch messages for first 3 conversations for instant display
      if (page === 1 && paginatedConversations.length > 0) {
        const topConversations = paginatedConversations.slice(0, 3);
        topConversations.forEach((conversation, index) => {
          const otherUser = conversation.participants?.find((p) => p._id !== user._id);
          if (otherUser && !messagesCacheRef.current.has(otherUser._id)) {
            // Prefetch with slight delay to not overwhelm server
            setTimeout(() => {
              getMessages(otherUser._id)
                .then(response => {
                  messagesCacheRef.current.set(otherUser._id, response.data || []);
                })
                .catch(err => console.error('Prefetch failed:', err));
            }, index * 100);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load conversations');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  const loadMoreConversations = () => {
    if (!loadingMore && hasMoreConversations) {
      loadConversations(conversationPage + 1, true);
    }
  };

  const loadMessages = async (userId, skipCache = false) => {
    try {
      // Check cache first for instant display
      if (!skipCache && messagesCacheRef.current.has(userId)) {
        const cachedMessages = messagesCacheRef.current.get(userId);
        setMessages(cachedMessages);
        
        // Still fetch fresh data in background and update only if different
        getMessages(userId).then(response => {
          const freshMessages = response.data || [];
          
          // Only update if messages actually changed (avoid unnecessary re-renders)
          if (JSON.stringify(freshMessages) !== JSON.stringify(cachedMessages)) {
            messagesCacheRef.current.set(userId, freshMessages);
            setMessages(freshMessages);
          }
        }).catch(err => console.error('Background refresh failed:', err));
        
        // Mark as read
        if (isTabVisible && !document.hidden) {
          markAsRead(userId).catch(err => console.error('Failed to mark as read:', err));
        }
        return;
      }
      
      // No cache - show empty and fetch
      setMessages([]);
      
      const response = await getMessages(userId);
      const fetchedMessages = response.data || [];
      
      // Cache the messages
      messagesCacheRef.current.set(userId, fetchedMessages);
      setMessages(fetchedMessages);
      
      // Mark as read only if tab is visible
      if (isTabVisible && !document.hidden) {
        await markAsRead(userId);
      }
    } catch (error) {
      toast.error('Failed to load messages');
      setMessages([]); // Clear messages on error
    }
  };

  const handleSelectUser = (conversation) => {
    const otherUser = conversation.participants.find((p) => p._id !== user._id);
    
    // Add online status from socket
    const userWithStatus = {
      ...otherUser,
      isOnline: onlineUsers.includes(otherUser._id),
      lastSeen: userStatus.get(otherUser._id)?.lastSeen || otherUser.lastSeen,
    };
    
    // Batch state updates for smoother transition
    setSelectedUser(userWithStatus);
    
    // Load messages (will use cache if available for instant display)
    loadMessages(otherUser._id);
    
    // Mark messages as read immediately if tab is visible
    if (isTabVisible && !document.hidden) {
      setTimeout(() => {
        markAsRead(otherUser._id).catch(err => console.error('Failed to mark as read:', err));
      }, 100);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newMessage.trim() && !selectedImage) return;
    if (!selectedUser) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update: Add message to UI immediately
    const optimisticMessage = {
      _id: tempId,
      content: messageText,
      sender: { _id: user._id },
      receiver: { _id: selectedUser._id },
      createdAt: new Date().toISOString(),
      isRead: false,
      image: imagePreview ? { url: imagePreview } : null,
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage(''); // Clear input immediately for next message
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setImagePreview(null);
    scrollToBottom();
    
    // Send in background without blocking
    try {
      const formData = new FormData();
      formData.append('receiver', selectedUser._id);
      if (messageText) {
        formData.append('content', messageText);
      }
      if (imageToSend) {
        formData.append('image', imageToSend);
      }

      await sendMessage(formData);
      // Update conversation list in background (debounced)
      debouncedLoadConversations();
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m._id !== tempId));
      setNewMessage(messageText); // Restore message text
      setSelectedImage(imageToSend);
      setImagePreview(optimisticMessage.image?.url);
      toast.error('Failed to send message');
    }
  };
  
  // Debounced version to prevent excessive API calls
  const debouncedLoadConversations = useCallback(
    debounce(() => loadConversations(), 500),
    []
  );

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedUser) return;
    
    if (!window.confirm(`Delete entire conversation with ${selectedUser.username}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteConversation(selectedUser._id);
      toast.success('Conversation deleted successfully');
      setMessages([]);
      setSelectedUser(null);
      loadConversations();
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-200 h-[calc(100vh-80px)] sm:h-[calc(100vh-120px)] flex overflow-hidden" style={{position: 'relative'}}>
        {/* Conversations List */}
        <div className={`${selectedUser ? 'hidden sm:flex' : 'flex'} w-full sm:w-1/3 border-r border-gray-200 flex-col bg-gray-50 overflow-hidden`}>
          <div className="p-3 sm:p-5 border-b border-gray-200 bg-white flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
                <FiMail size={40} className="sm:w-12 sm:h-12 mb-3" />
                <p className="text-xs sm:text-sm text-center">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conversation, index) => {
                const otherUser = conversation.participants?.find((p) => p._id !== user._id);
                if (!otherUser) return null;
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectUser(conversation)}
                    className={`p-3 sm:p-4 cursor-pointer hover:bg-white transition-all ${
                      selectedUser?._id === otherUser._id ? 'bg-white border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative">
                        {otherUser.profilePicture && !otherUser.profilePicture.includes('ui-avatars.com') ? (
                          <img
                            src={otherUser.profilePicture}
                            alt={otherUser.username}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-gray-200 object-cover"
                          />
                        ) : (
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-gray-200 flex items-center justify-center text-white text-lg sm:text-xl font-bold ${getAvatarColor(otherUser.username)}`}>
                            {getInitials(otherUser)}
                          </div>
                        )}
                        {(onlineUsers.includes(otherUser._id) || otherUser.isOnline) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{otherUser.username}</h3>
                        {conversation.lastMessage && (
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Load More Button */}
            {hasMoreConversations && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={loadMoreConversations}
                  disabled={loadingMore}
                  className="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {loadingMore ? 'Loading...' : 'Load More Conversations'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`${selectedUser ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-white overflow-hidden`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm flex-shrink-0" style={{position: 'sticky', top: 0, zIndex: 10}}>
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Back Button - Mobile Only */}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {selectedUser.profilePicture && !selectedUser.profilePicture.includes('ui-avatars.com') ? (
                    <img
                      src={selectedUser.profilePicture}
                      alt={selectedUser.username}
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-full ring-2 ring-gray-200 object-cover"
                    />
                  ) : (
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full ring-2 ring-gray-200 flex items-center justify-center text-white text-base sm:text-lg font-bold ${getAvatarColor(selectedUser.username)}`}>
                      {getInitials(selectedUser)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{selectedUser.username}</h3>
                    {onlineUsers.includes(selectedUser._id) ? (
                      <p className="text-xs text-green-500 font-medium">Active now</p>
                    ) : selectedUser.lastSeen ? (
                      <p className="text-xs text-gray-500">
                        Last seen {formatLastSeen(selectedUser.lastSeen)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Offline</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                  title="Delete conversation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400 animate-pulse">
                      <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-2"></div>
                      <p className="text-sm">Loading messages...</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const senderId = message.sender?._id || message.sender;
                    const isSent = senderId === user._id || senderId === user.id;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm select-none ${
                            isSent
                              ? 'bg-primary-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          {message.image && (
                            <img
                              src={message.image.url}
                              alt="Message attachment"
                              className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition"
                              onClick={() => window.open(message.image.url, '_blank')}
                            />
                          )}
                          {message.content && (
                            <p className="break-words select-text text-sm sm:text-base">{message.content}</p>
                          )}
                          <div className={`flex items-center justify-end gap-1 text-xs mt-1 ${
                            isSent ? 'text-primary-100' : 'text-gray-400'
                          }`}>
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isSent && (
                            <span className="ml-1">
                              {message.isRead ? (
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path d="M3 12l4 4L18 5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M9 12l4 4L24 5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path d="M3 12l4 4L18 5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M9 12l4 4L24 5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-2 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0" style={{position: 'sticky', bottom: 0, zIndex: 10}}>
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap gap-1 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiClick(emoji)}
                          className="text-xl sm:text-2xl hover:scale-125 transition-transform p-1"
                          type="button"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 sm:gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:bg-gray-100 hover:text-primary-600 p-2 sm:p-3 rounded-full transition flex-shrink-0"
                    title="Attach image"
                  >
                    <FiImage className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`${showEmojiPicker ? 'bg-primary-50 text-primary-600' : 'text-gray-500'} hover:bg-primary-50 hover:text-primary-600 p-2 sm:p-3 rounded-full transition flex-shrink-0`}
                    title="Add emoji"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedImage}
                    className="bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-semibold text-sm sm:text-base flex-shrink-0"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-4">
              <FiMessageCircle size={48} className="sm:w-16 sm:h-16 mb-4" />
              <p className="text-base sm:text-lg font-medium text-center">Select a conversation</p>
              <p className="text-xs sm:text-sm text-center">Choose from existing conversations or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
