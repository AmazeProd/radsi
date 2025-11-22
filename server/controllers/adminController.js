const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const Follower = require('../models/Follower');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStatistics = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const suspendedUsers = await User.countDocuments({ isActive: false });
  const totalPosts = await Post.countDocuments({ isDeleted: false });
  const totalComments = await Comment.countDocuments({ isDeleted: false });
  const totalMessages = await Message.countDocuments({ isDeleted: false });
  const totalFollowers = await Follower.countDocuments();

  // New users in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsers = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  // New posts in last 7 days
  const newPosts = await Post.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
    isDeleted: false,
  });

  // Most active users (by post count)
  const mostActiveUsers = await Post.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$user', postCount: { $sum: 1 } } },
    { $sort: { postCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        postCount: 1,
        'user.username': 1,
        'user.profilePicture': 1,
      },
    },
  ]);

  // Most liked posts
  const mostLikedPosts = await Post.find({ isDeleted: false })
    .sort({ likesCount: -1 })
    .limit(5)
    .populate('user', 'username profilePicture')
    .select('content likesCount commentsCount createdAt');

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalPosts,
        totalComments,
        totalMessages,
        totalFollowers,
        newUsers,
        newPosts,
      },
      mostActiveUsers,
      mostLikedPosts,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const filter = {};
  if (req.query.status) {
    filter.isActive = req.query.status === 'active';
  }
  if (req.query.role) {
    filter.role = req.query.role;
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: users,
  });
});

// @desc    Get single user details (admin view)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Get user statistics
  const postCount = await Post.countDocuments({ user: user._id, isDeleted: false });
  const commentCount = await Comment.countDocuments({ user: user._id, isDeleted: false });
  const followerCount = await Follower.countDocuments({ following: user._id });
  const followingCount = await Follower.countDocuments({ follower: user._id });

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      statistics: {
        postCount,
        commentCount,
        followerCount,
        followingCount,
      },
    },
  });
});

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    role: req.body.role,
    isActive: req.body.isActive,
    isVerified: req.body.isVerified,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user (admin) - Soft delete
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Prevent deleting own account
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }

  // Soft delete by deactivating
  user.isActive = false;
  await user.save();

  // Optionally, also soft delete all user's posts
  await Post.updateMany({ user: user._id }, { isDeleted: true, deletedAt: Date.now() });

  res.status(200).json({
    success: true,
    message: 'User account suspended',
  });
});

// @desc    Permanently delete user from database
// @route   DELETE /api/admin/users/:id/permanent
// @access  Private/Admin
exports.permanentDeleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Prevent deleting own account
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }

  const userId = user._id;
  const username = user.username;

  // Delete all related data
  await Post.deleteMany({ user: userId });
  await Comment.deleteMany({ user: userId });
  await Follower.deleteMany({ $or: [{ follower: userId }, { following: userId }] });
  await Like.deleteMany({ user: userId });
  
  // Finally delete the user
  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: `User ${username} and all related data permanently deleted`,
  });
});

// @desc    Suspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot suspend your own account', 400));
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User account suspended',
  });
});

// @desc    Reactivate user account
// @route   PUT /api/admin/users/:id/reactivate
// @access  Private/Admin
exports.reactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User account reactivated',
  });
});

// @desc    Get all posts (admin)
// @route   GET /api/admin/posts
// @access  Private/Admin
exports.getAllPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const filter = {};
  if (req.query.status === 'deleted') {
    filter.isDeleted = true;
  } else {
    filter.isDeleted = false;
  }

  const posts = await Post.find(filter)
    .populate('user', 'username email profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const total = await Post.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: posts,
  });
});

// @desc    Delete post (admin - content moderation)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  await post.softDelete();

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

// @desc    Get all comments (admin)
// @route   GET /api/admin/comments
// @access  Private/Admin
exports.getAllComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const filter = {};
  if (req.query.status === 'deleted') {
    filter.isDeleted = true;
  } else {
    filter.isDeleted = false;
  }

  const comments = await Comment.find(filter)
    .populate('user', 'username email profilePicture')
    .populate('post', 'content')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const total = await Comment.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: comments.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: comments,
  });
});

// @desc    Delete comment (admin - content moderation)
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  await comment.softDelete();

  // Update post comments count
  await Post.findByIdAndUpdate(comment.post, {
    $inc: { commentsCount: -1 },
  });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
  });
});
