const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
exports.getPostComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const comments = await Comment.find({
    post: req.params.postId,
    isDeleted: false,
    parentComment: null, // Only top-level comments
  })
    .populate('user', 'username firstName lastName profilePicture')
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'username firstName lastName profilePicture',
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const total = await Comment.countDocuments({
    post: req.params.postId,
    isDeleted: false,
    parentComment: null,
  });

  res.status(200).json({
    success: true,
    count: comments.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: comments,
  });
});

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = asyncHandler(async (req, res, next) => {
  const { postId, content, parentCommentId } = req.body;

  // Check if post exists
  const post = await Post.findById(postId);

  if (!post || post.isDeleted) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // If it's a reply, check if parent comment exists
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment || parentComment.isDeleted) {
      return next(new ErrorResponse('Parent comment not found', 404));
    }
  }

  const comment = await Comment.create({
    post: postId,
    user: req.user.id,
    content,
    parentComment: parentCommentId || null,
  });

  // Update post comments count
  post.commentsCount += 1;
  await post.save();

  // If it's a reply, add to parent's replies array
  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: comment._id },
    });
  }

  const populatedComment = await Comment.findById(comment._id).populate(
    'user',
    'username firstName lastName profilePicture'
  );

  // Create notification
  if (post.user.toString() !== req.user.id) {
    const notification = await Notification.create({
      recipient: post.user,
      sender: req.user.id,
      type: 'comment',
      post: post._id,
      comment: comment._id,
      content: `${req.user.username} commented on your post`,
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('send-notification', {
      recipientId: post.user.toString(),
      notification,
    });
  }

  // Emit socket event for new comment
  const io = req.app.get('io');
  io.emit('new-comment', {
    postId,
    comment: populatedComment,
  });

  res.status(201).json({
    success: true,
    data: populatedComment,
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);

  if (!comment || comment.isDeleted) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Check ownership
  if (comment.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this comment', 403));
  }

  comment.content = req.body.content;
  comment.isEdited = true;
  comment.editedAt = Date.now();
  await comment.save();

  comment = await Comment.findById(comment._id).populate(
    'user',
    'username firstName lastName profilePicture'
  );

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment || comment.isDeleted) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Check ownership
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this comment', 403));
  }

  // Soft delete
  await comment.softDelete();

  // Update post comments count
  await Post.findByIdAndUpdate(comment.post, {
    $inc: { commentsCount: -1 },
  });

  // If it has a parent, remove from parent's replies
  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $pull: { replies: comment._id },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

// @desc    Like comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.likeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment || comment.isDeleted) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Check if already liked
  if (comment.likes.includes(req.user.id)) {
    return next(new ErrorResponse('Comment already liked', 400));
  }

  comment.likes.push(req.user.id);
  comment.likesCount += 1;
  await comment.save();

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// @desc    Unlike comment
// @route   DELETE /api/comments/:id/unlike
// @access  Private
exports.unlikeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment || comment.isDeleted) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Check if not liked
  if (!comment.likes.includes(req.user.id)) {
    return next(new ErrorResponse('Comment not liked yet', 400));
  }

  comment.likes = comment.likes.filter((id) => id.toString() !== req.user.id);
  comment.likesCount -= 1;
  await comment.save();

  res.status(200).json({
    success: true,
    data: comment,
  });
});
