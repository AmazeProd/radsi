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
import { toast } from 'react-toastify';
import { FiMail, FiMessageCircle, FiImage, FiX, FiTrash2, FiArrowLeft, FiSend } from 'react-icons/fi';
import Avatar from '../components/common/Avatar';

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'Offline';
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMins = Math.floor((now - lastSeenDate) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const Messages = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesCacheRef = useRef(new Map());

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const response = await getConversations();
      const sorted = (response.data || []).sort((a, b) => {
        const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt || 0);
        return dateB - dateA;
      });
      setConversations(sorted);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (userId) => {
    try {
      if (messagesCacheRef.current.has(userId)) {
        setMessages(messagesCacheRef.current.get(userId));
        setTimeout(scrollToBottom, 100);
      }
      
      const response = await getMessages(userId);
      const fetchedMessages = response.data || [];
      messagesCacheRef.current.set(userId, fetchedMessages);
      setMessages(fetchedMessages);
      setTimeout(scrollToBottom, 100);
      
      await markAsRead(userId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [scrollToBottom]);

  const loadUserProfile = useCallback(async (userId) => {
    try {
      const response = await getUserProfile(userId);
      const userData = response.data;
      setSelectedUser({
        _id: userData._id,
        username: userData.username,
        profilePicture: userData.profilePicture,
        lastSeen: userData.lastSeen
      });
      await loadMessages(userId);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, [loadMessages]);

  const handleSelectUser = useCallback((conversation) => {
    const otherUser = conversation.participants?.find(p => p._id !== user._id);
    if (!otherUser) return;
    
    setSelectedUser({
      _id: otherUser._id,
      username: otherUser.username,
      profilePicture: otherUser.profilePicture,
      lastSeen: otherUser.lastSeen
    });
    loadMessages(otherUser._id);
  }, [user._id, loadMessages]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedUser) return;

    try {
      const formData = new FormData();
      if (newMessage.trim()) formData.append('content', newMessage.trim());
      if (selectedImage) formData.append('image', selectedImage);
      formData.append('receiverId', selectedUser._id);

      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        content: newMessage.trim(),
        sender: { _id: user._id },
        receiver: { _id: selectedUser._id },
        createdAt: new Date().toISOString(),
        isRead: false
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      setTimeout(scrollToBottom, 100);

      const response = await sendMessage(formData);
      setMessages(prev => prev.map(msg => msg._id === tempId ? response.data : msg));
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
    }
  }, [newMessage, selectedImage, selectedUser, user._id, scrollToBottom, loadConversations]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return toast.error('Image too large');
    if (!file.type.startsWith('image/')) return toast.error('Invalid file type');
    
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      loadConversations();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  }, [loadConversations]);

  const handleDeleteConversation = useCallback(async () => {
    if (!selectedUser || !window.confirm(`Delete conversation with ${selectedUser.username}?`)) return;
    try {
      await deleteConversation(selectedUser._id);
      setMessages([]);
      setSelectedUser(null);
      messagesCacheRef.current.delete(selectedUser._id);
      loadConversations();
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  }, [selectedUser, loadConversations]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      loadConversations();
      
      const conversationUserId = message.sender._id === user._id ? message.receiver._id : message.sender._id;
      if (messagesCacheRef.current.has(conversationUserId)) {
        const cached = messagesCacheRef.current.get(conversationUserId);
        if (!cached.some(m => m._id === message._id)) {
          messagesCacheRef.current.set(conversationUserId, [...cached, message]);
        }
      }
      
      if (selectedUser) {
        const isRelevant = 
          (message.sender?._id === selectedUser._id && message.receiver?._id === user._id) ||
          (message.sender?._id === user._id && message.receiver?._id === selectedUser._id);
        
        if (isRelevant) {
          setMessages(prev => {
            if (prev.some(m => m._id === message._id)) return prev;
            const tempIndex = prev.findIndex(m => 
              m._id.startsWith('temp-') && m.content === message.content && m.sender._id === message.sender._id
            );
            if (tempIndex !== -1) {
              const newMessages = [...prev];
              newMessages[tempIndex] = message;
              return newMessages;
            }
            return [...prev, message];
          });
          
          if (message.receiver?._id === user._id) {
            markAsRead(selectedUser._id).catch(console.error);
          }
          setTimeout(scrollToBottom, 100);
        }
      }
    };

    const handleMessagesRead = (data) => {
      if (data.senderId === user._id) {
        setMessages(prev => prev.map(msg => {
          const msgSender = msg.sender?._id || msg.sender;
          return msgSender === user._id ? { ...msg, isRead: true } : msg;
        }));
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket, selectedUser, user._id, loadConversations, scrollToBottom]);

  useEffect(() => {
    loadConversations();
    if (location.state?.userId) loadUserProfile(location.state.userId);
  }, [location.state, loadConversations, loadUserProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-gray-50 dark:bg-gray-900">
      {/* Conversations Sidebar */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800`}>
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FiMail className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.participants?.find(p => p._id !== user._id);
              if (!otherUser) return null;

              const isSelected = selectedUser?._id === otherUser._id;
              const isOnline = onlineUsers.includes(otherUser._id);
              const hasUnread = conversation.unreadCount > 0;

              return (
                <div
                  key={conversation._id}
                  onClick={() => handleSelectUser(conversation)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar user={otherUser} size="lg" clickable={false} />
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {otherUser.username}
                        </h3>
                        {conversation.lastMessage?.createdAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {hasUnread && (
                          <span className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                
                <Avatar user={selectedUser} size="sm" clickable={false} />
                
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{selectedUser.username}</h3>
                  {onlineUsers.includes(selectedUser._id) ? (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>Online
                    </p>
                  ) : selectedUser.lastSeen ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatLastSeen(selectedUser.lastSeen)}</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Offline</p>
                  )}
                </div>
              </div>

              <button onClick={handleDeleteConversation} className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete conversation">
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => {
                  const senderId = message.sender?._id || message.sender;
                  const isSent = senderId === user._id;

                  return (
                    <div key={message._id} className={`flex ${isSent ? 'justify-end' : 'justify-start'} group`}>
                      <div className="relative max-w-[70%]">
                        <div className={`rounded-2xl px-4 py-2 shadow ${isSent ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-gray-700'}`}>
                          {message.image && (
                            <img src={message.image.url} alt="attachment" className="rounded-lg mb-2 max-w-full cursor-pointer" onClick={() => window.open(message.image.url, '_blank')} />
                          )}
                          {message.content && <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>}
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs opacity-70">{formatTime(message.createdAt)}</span>
                            {isSent && message.isRead && <span className="text-xs opacity-70">✓✓</span>}
                          </div>
                        </div>
                        {isSent && (
                          <button onClick={() => handleDeleteMessage(message._id)} className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all shadow" title="Delete">
                            <FiTrash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-blue-500" />
                  <button onClick={() => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} type="button" className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow">
                    <FiX size={14} />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Attach image">
                  <FiImage className="w-5 h-5" />
                </button>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={!newMessage.trim() && !selectedImage} className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <FiMessageCircle className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
