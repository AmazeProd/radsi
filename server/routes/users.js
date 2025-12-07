const express = require('express');
const { body } = require('express-validator');
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  uploadAvatar,
  uploadCoverPhoto,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('../controllers/userController');
const { protect, optionalProtect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('website').optional().trim().isURL(),
];

// Routes
router.get('/search', searchUsers);
router.put('/me', protect, updateProfileValidation, validate, updateUserProfile);
router.post('/me/profile-picture', protect, uploadLimiter, upload.single('profilePicture'), uploadAvatar);
router.get('/:id', optionalProtect, getUserProfile);
router.put('/:id', protect, updateProfileValidation, validate, updateUserProfile);
router.delete('/:id', protect, deleteUserAccount);
router.post('/:id/avatar', protect, uploadLimiter, upload.single('avatar'), uploadAvatar);
router.post('/:id/cover', protect, uploadLimiter, upload.single('cover'), uploadCoverPhoto);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/unfollow', protect, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;

