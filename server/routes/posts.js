const express = require('express');
const { body } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getUserPosts,
  getTrendingPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const upload = require('../middleware/upload');
const { postLimiter, uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const createPostValidation = [
  body('content').optional().trim().isLength({ max: 2000 }),
];

const updatePostValidation = [
  body('content').trim().notEmpty().isLength({ max: 2000 }),
];

// Routes
router.get('/', getPosts);
router.get('/trending', getTrendingPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPost);
router.post(
  '/',
  protect,
  postLimiter,
  uploadLimiter,
  upload.array('images', 4),
  createPostValidation,
  validate,
  createPost
);
router.put('/:id', protect, updatePostValidation, validate, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/unlike', protect, unlikePost);

// Reaction routes
router.post('/:id/reactions', protect, require('../controllers/postController').addReaction);
router.delete('/:id/reactions', protect, require('../controllers/postController').removeReaction);

module.exports = router;
