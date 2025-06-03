import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/events.js';

const router = express.Router();

// Validation middleware for creating/updating events
// Based on Event.js model
const eventValidationRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  // Optional: coordinates validation if you have specific rules
  // body('coordinates.lat').optional().isNumeric().withMessage('Latitude must be a number'),
  // body('coordinates.lng').optional().isNumeric().withMessage('Longitude must be a number'),
  body('category').trim().notEmpty().withMessage('Category is required')
    .isIn(['Concert', 'Sports', 'Party', 'Conference', 'Workshop', 'Other']).withMessage('Invalid category'),
  body('maxParticipants').isInt({ min: 2 }).withMessage('Maximum participants must be at least 2'),
  body('ageRange.min').isInt({ min: 18 }).withMessage('Minimum age must be at least 18'),
  body('ageRange.max').isInt().custom((value, { req }) => {
    if (value < req.body.ageRange.min) {
      throw new Error('Maximum age must be greater than or equal to minimum age');
    }
    return true;
  }).withMessage('Maximum age must be greater than or equal to minimum age and be a number'),
  body('visibility').optional().isIn(['public', 'friends']).withMessage('Invalid visibility'),
  body('genderPreference').optional().isIn(['female', 'male', 'any']).withMessage('Invalid gender preference'),
  // Optional: imageUrl, photos, venue validation
];

// Middleware to handle validation results (can be moved to a shared middleware file if used elsewhere)
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes
router.post(
  '/',
  protect,
  eventValidationRules,
  // handleValidationErrors, // Controller now handles validationResult directly
  createEvent
);

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.put(
  '/:id',
  protect,
  eventValidationRules, // Can be more specific for updates if needed (e.g. some fields not updatable)
  // handleValidationErrors, // Controller now handles validationResult directly
  updateEvent
);

router.delete('/:id', protect, deleteEvent);

export default router;
