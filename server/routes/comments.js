const express = require('express');
const { body } = require('express-validator');
const {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const createCommentValidation = [
  body('postId').notEmpty().withMessage('Post ID is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  body('parentCommentId').optional(),
];

const updateCommentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

// Routes
router.get('/post/:postId', getPostComments);
router.post('/', protect, createCommentValidation, validate, createComment);
router.put('/:id', protect, updateCommentValidation, validate, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);
router.delete('/:id/unlike', protect, unlikeComment);

module.exports = router;
