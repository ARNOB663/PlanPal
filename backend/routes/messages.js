import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  sendMessage,
  getUserMessages,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/messages.js';

const router = express.Router();

// Middleware to handle validation results (can be shared if needed)
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules
const sendMessageRules = [
  body('receiver_id').trim().notEmpty().withMessage('Receiver ID is required')
    .isMongoId().withMessage('Invalid Receiver ID format'),
  body('content').trim().notEmpty().withMessage('Message content cannot be empty'),
];

const messageIdParamRules = [
  param('id').isMongoId().withMessage('Invalid Message ID format'),
];

// Routes
router.post(
  '/',
  protect,
  sendMessageRules,
  sendMessage
);

router.get(
  '/',
  protect,
  getUserMessages
);

router.patch(
  '/:id/read',
  protect,
  messageIdParamRules,
  markMessageAsRead
);

router.delete(
  '/:id',
  protect,
  messageIdParamRules,
  deleteMessage
);

export default router;
