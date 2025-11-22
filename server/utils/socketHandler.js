const Notification = require('../models/Notification');
const User = require('../models/User');

// Socket.io connection handler
const socketHandler = (io) => {
  // Store online users - userId -> socketId mapping
  const onlineUsers = new Map();
  
  // Make onlineUsers accessible from express app
  io.onlineUsers = onlineUsers;

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins
    socket.on('user-online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} is online`);

      // Update user status in database
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      // Send current online users to the newly connected user
      const currentOnlineUsers = Array.from(onlineUsers.keys());
      socket.emit('online-users-list', currentOnlineUsers);

      // Broadcast to all users (including sender) that this user is online
      io.emit('user-status', { userId, status: 'online' });
    });

    // User goes offline (switches tab)
    socket.on('user-offline', async (userId) => {
      if (userId) {
        console.log(`User ${userId} went offline (tab hidden)`);

        // Update user status in database
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Broadcast to all users
        io.emit('user-status', {
          userId,
          status: 'offline',
          lastSeen: new Date(),
        });
      }
    });

    // User typing indicator
    socket.on('typing', (data) => {
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user-typing', {
          userId: socket.userId,
          isTyping: data.isTyping,
        });
      }
    });

    // Send message
    socket.on('send-message', (data) => {
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive-message', data);
      }
    });

    // Send notification
    socket.on('send-notification', async (data) => {
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive-notification', data);
      }
    });

    // Like post
    socket.on('like-post', (data) => {
      socket.broadcast.emit('post-liked', data);
    });

    // New comment
    socket.on('new-comment', (data) => {
      socket.broadcast.emit('comment-added', data);
    });

    // New post
    socket.on('new-post', (data) => {
      socket.broadcast.emit('post-created', data);
    });

    // User disconnects
    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`User ${socket.userId} is offline`);

        // Update user status in database
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Broadcast to all users that this user is offline
        io.emit('user-status', {
          userId: socket.userId,
          status: 'offline',
          lastSeen: new Date(),
        });
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = socketHandler;
