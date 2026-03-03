const express = require('express');
const { body } = require('express-validator');
const { generateMessage } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter for AI routes (stricter)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 AI requests per 15 min
  message: {
    success: false,
    message: 'Too many AI requests, please try again later.',
  },
});

// Validation rules
const generateMessageValidation = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Prompt cannot exceed 500 characters'),
  body('tone')
    .optional()
    .isIn(['friendly', 'professional', 'funny', 'romantic', 'apologetic', 'encouraging'])
    .withMessage('Invalid tone selected'),
  body('context')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Context too long'),
];

// Routes
router.post(
  '/generate-message',
  protect,
  aiLimiter,
  generateMessageValidation,
  validate,
  generateMessage
);

module.exports = router;
