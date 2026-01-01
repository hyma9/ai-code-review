const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createSubmission,
  getAllSubmissions,
  getSubmission,
  getUserSubmissions,
  updateSubmission,
  deleteSubmission
} = require('../controllers/submissionController');

// Public routes
router.get('/', getAllSubmissions);
router.get('/:id', getSubmission);
router.get('/user/:userId', getUserSubmissions);

// Protected routes
router.post('/', protect, createSubmission);
router.put('/:id', protect, updateSubmission);
router.delete('/:id', protect, deleteSubmission);

module.exports = router;