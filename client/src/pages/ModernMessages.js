import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markAsRead, 
  deleteConversation, 
  deleteMessage 
} from '../services/messageService';
import { getUserProfile } from '../services/userService';
import { debounce } from '../utils/performance';
import ConfirmModal from '../components/common/ConfirmModal';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import ChatInput from '../components/messages/ChatInput';

const ModernMessages = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { socket, onlineUsers, userStatus } = useSocket();
  
  // State management
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const defaultWidth = Math.floor(window.innerWidth * 0.3);
    return Math.max(280, Math.min(600, defaultWidth));
  });
  const [isResizing, setIsResizing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, variant: 'danger' });
  
  // Refs
  const messagesCacheRef = useRef(new Map());
  const prevSelectedUserRef = useRef(null);

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

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
      if (!document.hidden && selectedUser) {
        markAsRead(selectedUser._id).catch(err => 
          console.error('Failed to mark as read:', err)
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedUser]);

  // Load initial data
  useEffect(() => {
    loadConversations();
    if (location.state?.userId) {
      loadUserProfile(location.state.userId);
    }
  }, [location.state, onlineUsers, userStatus]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      console.log('Received message:', message._id);
      
      loadConversations();
      
      const conversationUserId = 
        message.sender._id === user._id ? message.receiver._id : message.sender._id;
      
      if (messagesCacheRef.current.has(conversationUserId)) {
        const cachedMessages = messagesCacheRef.current.get(conversationUserId);
        const messageExists = cachedMessages.some(m => m._id === message._id);
        if (!messageExists) {
          messagesCacheRef.current.set(conversationUserId, [...cachedMessages, message]);
        }
      }
      
      if (selectedUser) {
        const isRelevant = 
          (message.sender?._id === selectedUser._id && message.receiver?._id === user._id) ||
          (message.sender?._id === user._id && message.receiver?._id === selectedUser._id);
        
        if (isRelevant) {
          setMessages(prev => {
            const existsById = prev.some(m => m._id === message._id);
            if (existsById) return prev;
            
            const tempIndex = prev.findIndex(m => 
              m._id.startsWith('temp-') && 
              m.content === message.content &&
              m.sender._id === message.sender._id
            );
            
            if (tempIndex !== -1) {
              const newMessages = [...prev];
              newMessages[tempIndex] = message;
              return newMessages;
            }
            
            return [...prev, message];
          });
          
          if (message.receiver?._id === user._id && isTabVisible) {
            markAsRead(selectedUser._id).catch(err => 
              console.error('Failed to mark as read:', err)
            );
          }
        }
      }
    };

    const handleMessagesRead = (data) => {
      if (data.senderId === user._id) {
        setMessages(prev =>
          prev.map(msg => {
            const msgSender = msg.sender?._id || msg.sender;
            if (msgSender === user._id) {
              return { ...msg, isRead: true, readAt: new Date() };
            }
            return msg;
          })
        );
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket, selectedUser, user, isTabVisible]);

  // Update selectedUser status
  useEffect(() => {
    if (selectedUser) {
      const isOnline = onlineUsers.includes(selectedUser._id);
      const status = userStatus.get(selectedUser._id);
      
      setSelectedUser(prev => {
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

  // Load conversations
  const loadConversations = async () => {
    try {
      const response = await getConversations();
      const allConversations = response.data || [];
      
      const sortedConversations = allConversations.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt || a.updatedAt || a.createdAt || 0;
        const dateB = b.lastMessage?.createdAt || b.updatedAt || b.createdAt || 0;
        return new Date(dateB) - new Date(dateA);
      });
      
      setConversations(sortedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load user profile
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
      console.error('Failed to load user profile:', error);
    }
  };

  // Load messages with instant display and scroll
  const loadMessages = async (userId, skipCache = false) => {
    try {
      // Check cache for instant display
      if (!skipCache && messagesCacheRef.current.has(userId)) {
        const cachedMessages = messagesCacheRef.current.get(userId);
        setMessages(cachedMessages);
        
        // Background refresh without blocking UI
        getMessages(userId).then(response => {
          const freshMessages = response.data || [];
          if (JSON.stringify(freshMessages) !== JSON.stringify(cachedMessages)) {
            messagesCacheRef.current.set(userId, freshMessages);
            setMessages(freshMessages);
          }
        }).catch(err => console.error('Background refresh failed:', err));
        
        if (isTabVisible) {
          markAsRead(userId).catch(err => console.error('Failed to mark as read:', err));
        }
        return;
      }
      
      // No cache - fetch fresh
      const response = await getMessages(userId);
      const fetchedMessages = response.data || [];
      
      messagesCacheRef.current.set(userId, fetchedMessages);
      setMessages(fetchedMessages);
      
      if (isTabVisible) {
        await markAsRead(userId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  // Handle select user with useCallback
  const handleSelectUser = useCallback((conversation) => {
    const otherUser = conversation.participants.find(p => p._id !== user._id);
    
    const userWithStatus = {
      ...otherUser,
      isOnline: onlineUsers.includes(otherUser._id),
      lastSeen: userStatus.get(otherUser._id)?.lastSeen || otherUser.lastSeen,
    };
    
    setSelectedUser(userWithStatus);
    loadMessages(otherUser._id);
    
    if (isTabVisible) {
      setTimeout(() => {
        markAsRead(otherUser._id).catch(err => 
          console.error('Failed to mark as read:', err)
        );
      }, 100);
    }
  }, [user._id, onlineUsers, userStatus, isTabVisible]);

  // Handle send message
  const handleSendMessage = async (messageText) => {
    if (!messageText && !selectedImage) return;
    if (!selectedUser) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      content: messageText,
      sender: { _id: user._id },
      receiver: { _id: selectedUser._id },
      createdAt: new Date().toISOString(),
      isRead: false,
      image: imagePreview ? { url: imagePreview } : null,
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setImagePreview(null);
    
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
      debouncedLoadConversations();
    } catch (error) {
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setSelectedImage(imageToSend);
      setImagePreview(optimisticMessage.image?.url);
      console.error('Failed to send message:', error);
    }
  };

  // Handle image select
  const handleImageSelect = (file) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle delete message with useCallback
  const handleDeleteMessage = useCallback((messageId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message?',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteMessage(messageId);
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
        } catch (error) {
          console.error('Failed to delete message:', error);
        }
      }
    });
  }, []);

  // Handle delete conversation with useCallback
  const handleDeleteConversation = useCallback(() => {
    if (!selectedUser) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Conversation',
      message: `Delete conversation with ${selectedUser.username}? This cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteConversation(selectedUser._id);
          setMessages([]);
          setSelectedUser(null);
          loadConversations();
        } catch (error) {
          console.error('Failed to delete conversation:', error);
        }
      }
    });
  }, [selectedUser]);

  // Debounced load conversations
  const debouncedLoadConversations = useCallback(
    debounce(() => loadConversations(), 500),
    []
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-800 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-medium text-gray-400 dark:text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="h-full bg-white dark:bg-gray-950 overflow-hidden">
      <div className={'h-full w-full mx-auto flex min-h-0 ' + (isResizing ? 'select-none' : '')}>
        {/* Conversation List */}
        <div 
          className={`
            ${selectedUser ? 'hidden md:flex' : 'flex'} 
            flex-shrink-0 border-r border-gray-100 dark:border-gray-800/80
          `}
          style={{
            width: window.innerWidth < 768 ? '100%' : `${sidebarWidth}px`,
            minWidth: window.innerWidth < 768 ? '100%' : '280px',
            maxWidth: window.innerWidth < 768 ? '100%' : '600px'
          }}
        >
          <ConversationList
            conversations={conversations}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            onlineUsers={onlineUsers}
            currentUser={user}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Resizable Divider */}
        <div
          className="hidden md:block w-[3px] bg-gray-100 dark:bg-gray-800/80 hover:bg-indigo-500 dark:hover:bg-indigo-600 cursor-col-resize transition-colors duration-200 relative group flex-shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-0 w-3 -mx-[5px]" />
        </div>

        {/* Chat Window */}
        <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden`}>
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            onBack={() => setSelectedUser(null)}
            onDeleteMessage={handleDeleteMessage}
            onDeleteConversation={handleDeleteConversation}
            isOnline={selectedUser ? onlineUsers.includes(selectedUser._id) : false}
            lastSeen={selectedUser?.lastSeen}
            currentUser={user}
            isLoading={false}
          />
          
          {/* Chat Input */}
          {selectedUser && (
            <ChatInput
              onSendMessage={handleSendMessage}
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              imagePreview={imagePreview}
              onRemoveImage={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              disabled={!selectedUser}
            />
          )}
        </div>
      </div>
    </div>

    {/* Confirm Modal */}
    <ConfirmModal
      isOpen={confirmModal.isOpen}
      title={confirmModal.title}
      message={confirmModal.message}
      variant={confirmModal.variant}
      confirmText="Delete"
      onConfirm={confirmModal.onConfirm}
      onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
    />
    </>
  );
};

export default ModernMessages;
