const express = require('express');
const { body } = require('express-validator');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  deleteConversation,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { messageLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('receiver').notEmpty().withMessage('Receiver ID is required'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
];

// Routes
router.get('/conversations', protect, getConversations);
router.get('/unread/count', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);
router.post('/', protect, messageLimiter, uploadLimiter, upload.single('image'), sendMessageValidation, validate, sendMessage);
router.put('/:userId/read', protect, markAsRead);
router.delete('/conversation/:userId', protect, deleteConversation);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
