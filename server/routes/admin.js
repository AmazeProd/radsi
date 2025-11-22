const express = require('express');
const { body } = require('express-validator');
const {
  getStatistics,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  suspendUser,
  reactivateUser,
  getAllPosts,
  deletePost,
  getAllComments,
  deleteComment,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Validation rules
const updateUserValidation = [
  body('firstName').optional().trim().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['user', 'admin']),
  body('isActive').optional().isBoolean(),
  body('isVerified').optional().isBoolean(),
];

// Dashboard & Statistics
router.get('/stats', getStatistics);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUserValidation, validate, updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/reactivate', reactivateUser);

// Content Moderation
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);
router.get('/comments', getAllComments);
router.delete('/comments/:id', deleteComment);

module.exports = router;
