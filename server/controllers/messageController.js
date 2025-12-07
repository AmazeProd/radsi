const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImage } = require('../utils/cloudinaryHelper');

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        isDeleted: false,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', req.user._id] },
            '$receiver',
            '$sender',
          ],
        },
        lastMessage: { $first: '$$ROOT' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    {
      $unwind: '$userInfo',
    },
    {
      $project: {
        _id: 1,
        participants: [
          {
            _id: '$userInfo._id',
            username: '$userInfo.username',
            firstName: '$userInfo.firstName',
            lastName: '$userInfo.lastName',
            profilePicture: '$userInfo.profilePicture',
            isOnline: '$userInfo.isOnline',
            lastSeen: '$userInfo.lastSeen',
          },
        ],
        lastMessage: '$lastMessage',
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: conversations,
  });
});

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;

  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id },
    ],
    isDeleted: false,
  })
    .populate('sender', 'username profilePicture')
    .populate('receiver', 'username profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const total = await Message.countDocuments({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id },
    ],
    isDeleted: false,
  });

  // Mark messages as read
  await Message.updateMany(
    {
      sender: req.params.userId,
      receiver: req.user.id,
      isRead: false,
    },
    {
      isRead: true,
      readAt: Date.now(),
    }
  );

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: messages.reverse(),
  });
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { receiver: receiverId, content } = req.body;

  // Check if content or image is provided
  if (!content && !req.file) {
    return next(new ErrorResponse('Message must contain text or an image', 400));
  }

  // Check if receiver exists
  const receiver = await User.findById(receiverId);

  if (!receiver) {
    return next(new ErrorResponse('Receiver not found', 404));
  }

  if (receiverId === req.user.id) {
    return next(new ErrorResponse('Cannot send message to yourself', 400));
  }

  let image = null;

  // Upload image if provided
  if (req.file) {
    const uploadResult = await uploadImage(req.file.path, 'social-media/messages');
    image = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    };
  }

  const message = await Message.create({
    sender: req.user.id,
    receiver: receiverId,
    content: content || '',
    image,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username profilePicture')
    .populate('receiver', 'username profilePicture');

  // Create notification
  const notification = await Notification.create({
    recipient: receiverId,
    sender: req.user.id,
    type: 'message',
    message: message._id,
    content: `${req.user.username} sent you a message`,
  });

  // Emit socket event - send to receiver only
  const io = req.app.get('io');
  const onlineUsers = io.onlineUsers || new Map();
  
  // Find receiver's socket ID and emit to them specifically
  const receiverSocketId = onlineUsers.get(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('receive-message', populatedMessage);
    
    // Send notification
    io.to(receiverSocketId).emit('send-notification', {
      recipientId: receiverId,
      notification,
    });
  }

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

// @desc    Mark messages from user as read
// @route   PUT /api/messages/:userId/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Mark all unread messages from this user as read
  const result = await Message.updateMany(
    {
      sender: userId,
      receiver: req.user.id,
      isRead: false,
    },
    {
      $set: { isRead: true, readAt: Date.now() },
    }
  );

  // Emit socket event to notify sender that their messages were read
  if (result.modifiedCount > 0) {
    const io = req.app.get('io');
    console.log('Emitting messages-read event:', { senderId: userId, readBy: req.user.id });
    io.emit('messages-read', {
      senderId: userId, // The person who sent the messages (needs to see blue ticks)
      readBy: req.user.id, // The person who read them
    });
  }

  res.status(200).json({
    success: true,
    data: { modifiedCount: result.modifiedCount },
  });
});

// @desc    Delete entire conversation with a user
// @route   DELETE /api/messages/conversation/:userId
// @access  Private
exports.deleteConversation = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Delete all messages between current user and the specified user
  const result = await Message.deleteMany({
    $or: [
      { sender: req.user.id, receiver: userId },
      { sender: userId, receiver: req.user.id },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
    data: { deletedCount: result.deletedCount },
  });
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new ErrorResponse('Message not found', 404));
  }

  // Only sender or receiver can delete
  if (
    message.sender.toString() !== req.user.id &&
    message.receiver.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to delete this message', 403));
  }

  message.deletedBy.push(req.user.id);

  // If both deleted, mark as deleted
  if (message.deletedBy.length >= 2) {
    message.isDeleted = true;
  }

  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully',
  });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Message.countDocuments({
    receiver: req.user.id,
    isRead: false,
    isDeleted: false,
  });

  res.status(200).json({
    success: true,
    count,
  });
});
