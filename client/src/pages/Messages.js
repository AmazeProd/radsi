import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getConversations, getMessages, sendMessage, markAsRead, deleteConversation, deleteMessage } from '../services/messageService';
import { getUserProfile } from '../services/userService';
import { toast } from 'react-toastify';
import { FiMail, FiMessageCircle, FiImage, FiX, FiTrash2, FiCheck, FiSend } from 'react-icons/fi';
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
  const [openMessageDropdown, setOpenMessageDropdown] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // Default to 30% of viewport width (minimum 280px, maximum 600px)
    const defaultWidth = Math.floor(window.innerWidth * 0.3);
    return Math.max(280, Math.min(600, defaultWidth));
  });
  const [isResizing, setIsResizing] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [chatTheme, setChatTheme] = useState(() => {
    return localStorage.getItem('chatTheme') || 'blue-gradient';
  });
  const messagesEndRef = useRef(null);
  const messagesCacheRef = useRef(new Map()); // Cache messages by userId
  const fileInputRef = useRef(null);
  // const pollIntervalRef = useRef(null);

  // Chat background themes
  const chatThemes = [
    {
      id: 'blue-gradient',
      name: 'Ocean Blue',
      background: 'linear-gradient(to bottom, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)',
      preview: 'bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300'
    },
    {
      id: 'purple-dream',
      name: 'Purple Dream',
      background: 'linear-gradient(to bottom, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)',
      pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,.15) 40px, rgba(255,255,255,.15) 80px)',
      preview: 'bg-gradient-to-b from-purple-100 via-purple-200 to-purple-300'
    },
    {
      id: 'sunset-orange',
      name: 'Sunset Orange',
      background: 'linear-gradient(to bottom, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,.2) 30px, rgba(255,255,255,.2) 60px)',
      preview: 'bg-gradient-to-b from-orange-100 via-orange-200 to-orange-300'
    },
    {
      id: 'mint-fresh',
      name: 'Mint Fresh',
      background: 'linear-gradient(to bottom, #e0f2f1 0%, #b2dfdb 50%, #80cbc4 100%)',
      pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.12) 35px, rgba(255,255,255,.12) 70px)',
      preview: 'bg-gradient-to-b from-teal-100 via-teal-200 to-teal-300'
    },
    {
      id: 'rose-pink',
      name: 'Rose Pink',
      background: 'linear-gradient(to bottom, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 38px, rgba(255,255,255,.18) 38px, rgba(255,255,255,.18) 76px)',
      preview: 'bg-gradient-to-b from-pink-100 via-pink-200 to-pink-300'
    },
    {
      id: 'forest-green',
      name: 'Forest Green',
      background: 'linear-gradient(to bottom, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
      pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 42px, rgba(255,255,255,.14) 42px, rgba(255,255,255,.14) 84px)',
      preview: 'bg-gradient-to-b from-green-100 via-green-200 to-green-300'
    },
    {
      id: 'lavender-sky',
      name: 'Lavender Sky',
      background: 'linear-gradient(to bottom, #ede7f6 0%, #d1c4e9 50%, #b39ddb 100%)',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 36px, rgba(255,255,255,.16) 36px, rgba(255,255,255,.16) 72px)',
      preview: 'bg-gradient-to-b from-indigo-100 via-indigo-200 to-indigo-300'
    },
    {
      id: 'coral-reef',
      name: 'Coral Reef',
      background: 'linear-gradient(to bottom, #fbe9e7 0%, #ffccbc 50%, #ffab91 100%)',
      pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 33px, rgba(255,255,255,.2) 33px, rgba(255,255,255,.2) 66px)',
      preview: 'bg-gradient-to-b from-red-100 via-red-200 to-red-300'
    }
  ];

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('chatTheme', chatTheme);
  }, [chatTheme]);

  // Common emojis for quick access
  const commonEmojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🎉', '🔥', '✨', '💯', '🙌', '👏', '🎊', '💪', '🌟', '😊', '🤗', '😅', '😢', '😭', '😡', '🤣', '😜', '😇', '🥳', '😴', '🤩', '😱'];

  // Handle resizing sidebar
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Close theme selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showThemeSelector && !e.target.closest('.theme-selector-container')) {
        setShowThemeSelector(false);
      }
    };

    if (showThemeSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThemeSelector]);

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

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Image size should be less than 50MB');
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

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMessage(messageId);
      setMessages(messages.filter(msg => msg._id !== messageId));
      toast.success('Message deleted');
      setOpenMessageDropdown(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error(error.response?.data?.message || 'Failed to delete message');
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
    <div style={{ height: '100svh' }} className="bg-gray-100 dark:bg-gray-950 transition-colors overflow-hidden">
      <div className="h-full mx-auto px-0 md:px-4 md:py-4">
        <div className={"bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 h-full md:h-[calc(100%-2rem)] flex overflow-hidden shadow-2xl md:rounded-2xl transition-colors border-0 md:border border-gray-200 dark:border-gray-800 " + (isResizing ? 'select-none' : '')}>
          {/* Conversations List */}
          <div 
            className={(selectedUser ? 'hidden md:flex' : 'flex') + ' border-r border-gray-200 dark:border-gray-800 flex-col bg-white dark:bg-gray-900 transition-colors'}
            style={{ 
              width: selectedUser ? `${sidebarWidth}px` : (window.innerWidth >= 768 ? `${sidebarWidth}px` : '100%'), 
              minWidth: '280px', 
              maxWidth: '600px' 
            }}
          >
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 shadow-sm transition-colors">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 px-4 py-12">
                <FiMail className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-sm sm:text-base text-center font-medium">No conversations yet</p>
                <p className="text-xs text-center mt-2">Start chatting with your connections</p>
              </div>
            ) : (
              conversations.map((conversation, index) => {
                const otherUser = conversation.participants?.find((p) => p._id !== user._id);
                if (!otherUser) return null;
                
                const isSelected = selectedUser?._id === otherUser._id;
                const baseClasses = "p-3 sm:p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-all border-b border-gray-100 dark:border-gray-800";
                const selectedClasses = isSelected ? " bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 shadow-sm" : "";
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectUser(conversation)}
                    className={baseClasses + selectedClasses}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {otherUser.profilePicture && !otherUser.profilePicture.includes('ui-avatars.com') ? (
                          <img
                            src={otherUser.profilePicture}
                            alt={otherUser.username}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-white object-cover shadow-sm"
                          />
                        ) : (
                          <div className={"w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-white flex items-center justify-center text-white text-xl font-bold shadow-sm " + getAvatarColor(otherUser.username)}>
                            {getInitials(otherUser)}
                          </div>
                        )}
                        {(onlineUsers.includes(otherUser._id) || otherUser.isOnline) && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">{otherUser.username}</h3>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {conversation.lastMessage.content || '📷 Photo'}
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

          {/* Resizable Divider */}
          {selectedUser && (
            <div
              className="hidden md:block w-1 bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-blue-500 cursor-col-resize transition-colors relative group"
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-0 w-4 -mx-1.5" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>
          )}

        {/* Messages Area */}
        <div className={(selectedUser ? 'flex' : 'hidden md:flex') + ' flex-1 flex-col bg-white dark:bg-gray-950 transition-colors overflow-hidden'}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-md flex-shrink-0 backdrop-blur-lg transition-colors sticky top-0 z-20">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Back Button - Mobile Only */}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {selectedUser.profilePicture && !selectedUser.profilePicture.includes('ui-avatars.com') ? (
                    <img
                      src={selectedUser.profilePicture}
                      alt={selectedUser.username}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full ring-2 ring-gray-200 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={"w-11 h-11 sm:w-12 sm:h-12 rounded-full ring-2 ring-gray-200 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 " + getAvatarColor(selectedUser.username)}>
                      {getInitials(selectedUser)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-base sm:text-lg">{selectedUser.username}</h3>
                    {onlineUsers.includes(selectedUser._id) ? (
                      <p className="text-xs sm:text-sm text-green-500 dark:text-green-400 font-medium">● Active now</p>
                    ) : selectedUser.lastSeen ? (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {formatLastSeen(selectedUser.lastSeen)}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500">Offline</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowThemeSelector(!showThemeSelector)}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition"
                    title="Change chat theme"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDeleteConversation}
                    className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition"
                    title="Delete conversation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Theme Selector Dropdown */}
              {showThemeSelector && (
                <div className="theme-selector-container absolute top-16 right-4 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-80 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Chat Themes</h3>
                    <button
                      onClick={() => setShowThemeSelector(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {chatThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setChatTheme(theme.id);
                          setShowThemeSelector(false);
                        }}
                        className={'relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ' + (chatTheme === theme.id ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-300 dark:border-gray-600')}
                      >
                        <div className={'h-20 ' + theme.preview}></div>
                        <div className="p-2 bg-white dark:bg-gray-900">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 text-center">{theme.name}</p>
                        </div>
                        {chatTheme === theme.id && (
                          <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scroll-smooth relative overscroll-contain" style={{
                background: chatThemes.find(t => t.id === chatTheme)?.background || chatThemes[0].background,
                backgroundImage: `
                  ${chatThemes.find(t => t.id === chatTheme)?.background.replace('linear-gradient', 'linear-gradient').replace(/\)$/, ', 0.9)')},
                  ${chatThemes.find(t => t.id === chatTheme)?.pattern || chatThemes[0].pattern}
                `
              }}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <div className="inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-sm font-medium">Loading messages...</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const senderId = message.sender?._id || message.sender;
                    const isSent = senderId === user._id || senderId === user.id;
                    
                    return (
                      <div
                        key={message._id}
                        className={'flex ' + (isSent ? 'justify-end' : 'justify-start') + ' animate-fadeIn group'}
                      >
                        <div className="relative max-w-[85%] sm:max-w-[70%]">
                          <div
                            className={'rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 select-none backdrop-blur-sm ' + (
                              isSent
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-lg'
                                : 'bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50 rounded-bl-none shadow-md'
                            )}
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
                              <p className="break-words select-text text-sm sm:text-base leading-relaxed">{message.content}</p>
                            )}
                            <div className={'flex items-center justify-end gap-1 text-xs mt-1.5 ' + (
                              isSent ? 'text-blue-100' : 'text-gray-500'
                            )}>
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
                        
                        {/* Delete Button */}
                        {isSent && (
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 p-1 transition-opacity"
                            title="Delete message"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/95 to-indigo-50/95 dark:from-gray-800/98 dark:to-gray-900/98 backdrop-blur-lg flex-shrink-0 sticky bottom-0 z-50 transition-colors shadow-lg">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-white dark:border-gray-800"
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
                  <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md transition-colors">
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
                    className="text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 p-2 sm:p-3 rounded-full transition flex-shrink-0"
                    title="Attach image"
                  >
                    <FiImage className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={(showEmojiPicker ? 'bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400') + ' hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 p-2 sm:p-3 rounded-full transition flex-shrink-0'}
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
                    className="flex-1 px-4 sm:px-5 py-3 sm:py-3 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-base sm:text-base transition-all shadow-sm min-h-[48px] sm:min-h-0"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedImage}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 sm:px-7 sm:py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 font-semibold text-sm sm:text-base flex-shrink-0 shadow-lg hover:shadow-xl flex items-center justify-center min-w-[48px] sm:min-w-0"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FiSend className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 px-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
              <FiMessageCircle size={48} className="sm:w-16 sm:h-16 mb-4" />
              <p className="text-base sm:text-lg font-medium text-center">Select a conversation</p>
              <p className="text-xs sm:text-sm text-center">Choose from existing conversations or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default Messages;
