const User = require('../models/User');
const Submission = require('../models/Submission');
const Review = require('../models/Review');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get submissions count
    const submissionsCount = await Submission.countDocuments({ author: req.params.id });

    // Get reviews given count
    const reviewsGivenCount = await Review.countDocuments({ reviewer: req.params.id });

    // Get average rating from submissions
    const submissions = await Submission.find({ author: req.params.id });
    const totalRating = submissions.reduce((sum, s) => sum + s.averageRating, 0);
    const averageRating = submissions.length > 0 ? totalRating / submissions.length : 0;

    // Get total views on submissions
    const totalViews = submissions.reduce((sum, s) => sum + s.viewCount, 0);

    res.status(200).json({
      success: true,
      stats: {
        submissionsCount,
        reviewsGivenCount,
        averageRating: averageRating.toFixed(1),
        reputation: user.reputation,
        totalViews
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user statistics'
    });
  }
};

// @desc    Get all users (for leaderboard)
// @route   GET /api/users
// @access  Public
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'reputation' } = req.query;

    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users: users.map(u => u.getPublicProfile())
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
};