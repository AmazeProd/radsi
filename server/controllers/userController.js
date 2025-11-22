const User = require('../models/User');
const Post = require('../models/Post');
const Follower = require('../models/Follower');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImage, deleteImage } = require('../utils/cloudinaryHelper');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('followers', 'username profilePicture')
    .populate('following', 'username profilePicture');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Get user's post count
  const postCount = await Post.countDocuments({ user: user._id, isDeleted: false });

  // Check if current user is following this profile (if authenticated)
  let isFollowing = false;
  if (req.user) {
    const followRelation = await Follower.findOne({
      follower: req.user._id,
      following: req.params.id,
    });
    isFollowing = !!followRelation;
  }

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      postCount,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/users/me or PUT /api/users/:id
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  // Determine which user ID to update
  let userId;
  
  if (req.params.id === 'me') {
    // For /me route, use authenticated user's ID
    userId = req.user._id;
  } else {
    // For /:id route, check authorization
    userId = req.params.id;
    
    // Only allow users to update their own profile (or admins can update any)
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this profile', 403));
    }
  }

  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    bio: req.body.bio,
    location: req.body.location,
    website: req.body.website,
    dateOfBirth: req.body.dateOfBirth,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
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

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUserAccount = asyncHandler(async (req, res, next) => {
  // Check if user is deleting their own account
  if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this account', 403));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Soft delete by deactivating account
  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// @desc    Upload profile picture
// @route   POST /api/users/:id/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (req.params.id !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this profile', 403));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Delete old profile picture if exists (not default)
  if (
    user.profilePicture &&
    !user.profilePicture.includes('avatar-default')
  ) {
    const publicId = user.profilePicture.split('/').pop().split('.')[0];
    await deleteImage(`social-media/avatars/${publicId}`);
  }

  // Upload new image
  const result = await uploadImage(req.file.path, 'social-media/avatars');

  user.profilePicture = result.url;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Upload cover photo
// @route   POST /api/users/:id/cover
// @access  Private
exports.uploadCoverPhoto = asyncHandler(async (req, res, next) => {
  if (req.params.id !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this profile', 403));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Delete old cover photo if exists
  if (user.coverPhoto) {
    const publicId = user.coverPhoto.split('/').pop().split('.')[0];
    await deleteImage(`social-media/covers/${publicId}`);
  }

  // Upload new image
  const result = await uploadImage(req.file.path, 'social-media/covers');

  user.coverPhoto = result.url;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { query, page = 1, limit = 20 } = req.query;

  if (!query) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const users = await User.find(
    {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ],
      isActive: true,
    },
    'username firstName lastName profilePicture bio'
  )
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
    ],
    isActive: true,
  });

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: users,
  });
});

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res, next) => {
  console.log('Follow attempt:', {
    userToFollow: req.params.id,
    currentUser: req.user._id.toString(),
  });

  const userToFollow = await User.findById(req.params.id);

  if (!userToFollow) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if trying to follow yourself
  if (req.params.id === req.user._id.toString() || req.params.id === req.user.id) {
    return next(new ErrorResponse('You cannot follow yourself', 400));
  }

  // Check if already following
  const existingFollow = await Follower.findOne({
    follower: req.user._id,
    following: req.params.id,
  });

  console.log('Existing follow relationship:', existingFollow);

  if (existingFollow) {
    // Instead of error, just return success (idempotent)
    return res.status(200).json({
      success: true,
      message: 'Already following this user',
    });
  }

  // Create follower relationship
  await Follower.create({
    follower: req.user._id,
    following: req.params.id,
  });

  // Update user documents
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { following: req.params.id },
  });

  await User.findByIdAndUpdate(req.params.id, {
    $addToSet: { followers: req.user._id },
  });

  // Create notification
  const notification = await Notification.create({
    recipient: req.params.id,
    sender: req.user._id,
    type: 'follow',
    content: `${req.user.username} started following you`,
  });

  // Emit socket event
  const io = req.app.get('io');
  io.emit('send-notification', {
    recipientId: req.params.id,
    notification,
  });

  res.status(200).json({
    success: true,
    message: 'User followed successfully',
  });
});

// @desc    Unfollow user
// @route   DELETE /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.id);

  if (!userToUnfollow) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Remove follower relationship
  await Follower.findOneAndDelete({
    follower: req.user._id,
    following: req.params.id,
  });

  // Update user documents
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { following: req.params.id },
  });

  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user._id },
  });

  res.status(200).json({
    success: true,
    message: 'User unfollowed successfully',
  });
});

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = asyncHandler(async (req, res, next) => {
  const followers = await Follower.find({ following: req.params.id })
    .populate('follower', 'username firstName lastName profilePicture bio')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: followers.length,
    data: followers.map((f) => f.follower),
  });
});

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = asyncHandler(async (req, res, next) => {
  const following = await Follower.find({ follower: req.params.id })
    .populate('following', 'username firstName lastName profilePicture bio')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: following.length,
    data: following.map((f) => f.following),
  });
});
