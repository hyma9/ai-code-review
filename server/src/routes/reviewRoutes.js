const express = require('express');
const router = express.Router();
const {
  createReview,
  getSubmissionReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/submission/:submissionId', getSubmissionReviews);
router.get('/user/:userId', getUserReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);

module.exports = router;