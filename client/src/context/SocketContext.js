import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userStatus, setUserStatus] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const { user, isAuthenticated } = useAuth();

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      
      if (socket && user) {
        const userId = user._id || user.id;
        if (visible) {
          // User came back, mark as online
          socket.emit('user-online', userId);
        } else {
          // User left tab, mark as offline
          socket.emit('user-offline', userId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, user]);

  useEffect(() => {
    if (isAuthenticated && user && isTabVisible) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL;
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        const userId = user._id || user.id;
        console.log('Emitting user-online for:', userId);
        newSocket.emit('user-online', userId);
      });

      newSocket.on('online-users-list', (users) => {
        console.log('Received online users list:', users);
        setOnlineUsers(users);
      });

      newSocket.on('user-status', (data) => {
        console.log('User status received:', data);
        
        if (data.status === 'online') {
          setOnlineUsers((prev) => {
            // Avoid duplicates
            if (prev.includes(data.userId)) return prev;
            const updated = [...prev, data.userId];
            console.log('Online users updated:', updated);
            return updated;
          });
          setUserStatus((prev) => {
            const newStatus = new Map(prev);
            newStatus.set(data.userId, { isOnline: true, lastSeen: null });
            return newStatus;
          });
        } else {
          setOnlineUsers((prev) => {
            const updated = prev.filter((id) => id !== data.userId);
            console.log('Online users updated (offline):', updated);
            return updated;
          });
          setUserStatus((prev) => {
            const newStatus = new Map(prev);
            newStatus.set(data.userId, { isOnline: false, lastSeen: data.lastSeen || new Date() });
            return newStatus;
          });
        }
      });

      newSocket.on('receive-notification', (data) => {
        setNotifications((prev) => [data.notification, ...prev]);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user, isTabVisible]);

  const sendNotification = (recipientId, notification) => {
    if (socket) {
      socket.emit('send-notification', { recipientId, ...notification });
    }
  };

  const sendMessage = (recipientId, message) => {
    if (socket) {
      socket.emit('send-message', { recipientId, message });
    }
  };

  const emitTyping = (recipientId, isTyping) => {
    if (socket) {
      socket.emit('typing', { recipientId, isTyping });
    }
  };

  const value = {
    socket,
    onlineUsers,
    userStatus,
    notifications,
    sendNotification,
    sendMessage,
    emitTyping,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
