const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadMultipleImages, deleteImage } = require('../utils/cloudinaryHelper');

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  console.log('getPosts called, req.user:', req.user ? req.user.id : 'not authenticated');
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { isDeleted: false };

  // If user is authenticated, show posts from following + own posts
  if (req.user) {
    const user = await User.findById(req.user.id);
    const followingIds = user.following.map((id) => id.toString());
    query.user = { $in: [...followingIds, req.user.id] };
  }

  const posts = await Post.find(query)
    .populate('user', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Add isLiked field for authenticated user
  const postsWithLikeStatus = posts.map(post => {
    const postObj = post.toObject();
    if (req.user) {
      // Check if current user's ID is in the likes array
      const userIdStr = req.user.id.toString();
      const likesArray = post.likes || [];
      postObj.isLiked = likesArray.some(likeId => likeId.toString() === userIdStr);
      
      // Debug log for first post
      if (posts.indexOf(post) === 0) {
        console.log('First post debug:');
        console.log('  Post ID:', post._id);
        console.log('  User ID:', userIdStr);
        console.log('  Likes array:', likesArray.map(l => l.toString()));
        console.log('  isLiked:', postObj.isLiked);
      }
    } else {
      postObj.isLiked = false;
    }
    return postObj;
  });

  const total = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    count: postsWithLikeStatus.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: postsWithLikeStatus,
  });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('user', 'username firstName lastName profilePicture')
    .populate('likes', 'username profilePicture');

  if (!post || post.isDeleted) {
    return next(new ErrorResponse('Post not found', 404));
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  console.log('=== CREATE POST ===');
  console.log('Content:', content);
  console.log('Files:', req.files);
  console.log('Files length:', req.files?.length);

  // Allow posts with only images (text is optional)
  if (!content?.trim() && (!req.files || req.files.length === 0)) {
    return next(new ErrorResponse('Post must contain text or images', 400));
  }

  let images = [];

  // Upload images if provided
  if (req.files && req.files.length > 0) {
    console.log('Uploading images to Cloudinary...');
    images = await uploadMultipleImages(req.files, 'social-media/posts');
    console.log('Images uploaded:', images);
  }

  const post = await Post.create({
    user: req.user.id,
    content,
    images,
  });

  const populatedPost = await Post.findById(post._id).populate(
    'user',
    'username firstName lastName profilePicture'
  );

  // Emit socket event for new post
  const io = req.app.get('io');
  io.emit('new-post', { post: populatedPost });

  res.status(201).json({
    success: true,
    data: populatedPost,
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post || post.isDeleted) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check ownership
  if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this post', 403));
  }

  const { content } = req.body;

  post.content = content || post.content;
  post.isEdited = true;
  post.editedAt = Date.now();

  await post.save();

  post = await Post.findById(post._id).populate(
    'user',
    'username firstName lastName profilePicture'
  );

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post || post.isDeleted) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check ownership
  if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this post', 403));
  }

  // Soft delete
  await post.softDelete();

  // Delete images from Cloudinary
  if (post.images && post.images.length > 0) {
    for (const image of post.images) {
      if (image.publicId) {
        await deleteImage(image.publicId);
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

// @desc    Like post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post || post.isDeleted) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check if already liked
  const alreadyLiked = post.likes.some(likeId => likeId.toString() === req.user.id.toString());
  
  if (alreadyLiked) {
    return next(new ErrorResponse('Post already liked', 400));
  }

  post.likes.push(req.user.id);
  post.likesCount += 1;
  await post.save();

  // Create notification
  if (post.user.toString() !== req.user.id) {
    const notification = await Notification.create({
      recipient: post.user,
      sender: req.user.id,
      type: 'like',
      post: post._id,
      content: `${req.user.username} liked your post`,
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('send-notification', {
      recipientId: post.user.toString(),
      notification,
    });
  }

  // Emit socket event for like
  const io = req.app.get('io');
  io.emit('like-post', {
    postId: post._id,
    userId: req.user.id,
    likesCount: post.likesCount,
  });

  const postObj = post.toObject();
  postObj.isLiked = true;

  res.status(200).json({
    success: true,
    data: postObj,
  });
});

// @desc    Unlike post
// @route   DELETE /api/posts/:id/unlike
// @access  Private
exports.unlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post || post.isDeleted) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check if not liked
  const isLiked = post.likes.some(likeId => likeId.toString() === req.user.id.toString());
  if (!isLiked) {
    return next(new ErrorResponse('Post not liked yet', 400));
  }

  post.likes = post.likes.filter((id) => id.toString() !== req.user.id.toString());
  post.likesCount -= 1;
  await post.save();

  const postObj = post.toObject();
  postObj.isLiked = false;

  res.status(200).json({
    success: true,
    data: postObj,
  });
});

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const posts = await Post.find({ user: req.params.userId, isDeleted: false })
    .populate('user', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const total = await Post.countDocuments({ user: req.params.userId, isDeleted: false });

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: posts,
  });
});

// @desc    Get trending posts (most liked in last 24 hours)
// @route   GET /api/posts/trending
// @access  Public
exports.getTrendingPosts = asyncHandler(async (req, res, next) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const posts = await Post.find({
    isDeleted: false,
    createdAt: { $gte: oneDayAgo },
  })
    .populate('user', 'username firstName lastName profilePicture')
    .sort({ likesCount: -1, commentsCount: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: posts,
  });
});

// @desc    Add or update reaction to a post
// @route   POST /api/posts/:id/reactions
// @access  Private
exports.addReaction = asyncHandler(async (req, res, next) => {
  const { emoji } = req.body;
  
  if (!emoji) {
    return next(new ErrorResponse('Emoji reaction is required', 400));
  }

  const allowedEmojis = ['❤️', '🔥', '👏', '😍', '💯', '🎉', '👍', '🙌', '😂', '😮', '😢', '😡'];
  if (!allowedEmojis.includes(emoji)) {
    return next(new ErrorResponse('Invalid reaction emoji', 400));
  }

  const post = await Post.findById(req.params.id);

  if (!post || post.isDeleted) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Find if user already reacted
  const existingReactionIndex = post.reactions.findIndex(
    r => r.user.toString() === req.user.id
  );

  if (existingReactionIndex > -1) {
    // Update existing reaction
    const oldEmoji = post.reactions[existingReactionIndex].type;
    post.reactions[existingReactionIndex].type = emoji;
    post.reactions[existingReactionIndex].createdAt = new Date();
    
    // Update counts
    if (post.reactionCounts[oldEmoji] > 0) {
      post.reactionCounts[oldEmoji] -= 1;
    }
    post.reactionCounts[emoji] = (post.reactionCounts[emoji] || 0) + 1;
  } else {
    // Add new reaction
    post.reactions.push({
      user: req.user.id,
      type: emoji,
      createdAt: new Date()
    });
    post.reactionCounts[emoji] = (post.reactionCounts[emoji] || 0) + 1;
  }

  await post.save();

  // Create notification for post owner if it's not their own post
  if (post.user.toString() !== req.user.id) {
    await Notification.create({
      recipient: post.user,
      sender: req.user.id,
      type: 'reaction',
      post: post._id,
      message: `reacted ${emoji} to your post`,
    });
  }

  const populatedPost = await Post.findById(post._id)
    .populate('user', 'username firstName lastName profilePicture avatar')
    .populate('reactions.user', 'username firstName lastName');

  res.status(200).json({
    success: true,
    data: populatedPost,
  });
});

// @desc    Remove reaction from a post
// @route   DELETE /api/posts/:id/reactions
// @access  Private
exports.removeReaction = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post || post.isDeleted) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Find user's reaction
  const reactionIndex = post.reactions.findIndex(
    r => r.user.toString() === req.user.id
  );

  if (reactionIndex === -1) {
    return next(new ErrorResponse('You have not reacted to this post', 400));
  }

  const emoji = post.reactions[reactionIndex].type;
  
  // Remove reaction
  post.reactions.splice(reactionIndex, 1);
  
  // Update count
  if (post.reactionCounts[emoji] > 0) {
    post.reactionCounts[emoji] -= 1;
  }

  await post.save();

  const populatedPost = await Post.findById(post._id)
    .populate('user', 'username firstName lastName profilePicture avatar')
    .populate('reactions.user', 'username firstName lastName');

  res.status(200).json({
    success: true,
    data: populatedPost,
  });
});
