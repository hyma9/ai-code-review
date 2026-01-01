const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserStats,
  getAllUsers
} = require('../controllers/userController');

// All public routes
router.get('/', getAllUsers);
router.get('/:id', getUserProfile);
router.get('/:id/stats', getUserStats);

module.exports = router;