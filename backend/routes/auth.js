import express from 'express';
import { body } from 'express-validator';
import { register, login, resetPassword, forgotPassword } from '../controllers/auth.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('age').isInt({ min: 18 }).withMessage('Must be at least 18 years old'),
  body('interests').isArray().withMessage('Interests must be an array')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;