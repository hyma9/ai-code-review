const Review = require('../models/Review');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { submissionId, rating, comment, codeSnippets } = req.body;

    // Validation
    if (!submissionId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user is trying to review their own submission
    if (submission.author.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review your own submission'
      });
    }

    // Check if user already reviewed this submission
    const existingReview = await Review.findOne({
      submission: submissionId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this submission'
      });
    }

    // Create review
    const review = await Review.create({
      submission: submissionId,
      reviewer: req.user.id,
      rating,
      comment,
      codeSnippets: codeSnippets || []
    });

    // Add review to submission
    submission.reviews.push(review._id);
    submission.reviewCount += 1;

    // Update submission status
    if (submission.status === 'pending') {
      submission.status = 'in_review';
    }

    // Calculate new average rating
    const allReviews = await Review.find({ submission: submissionId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    submission.averageRating = totalRating / allReviews.length;

    await submission.save();

    // Update reviewer's review count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { reviewsGivenCount: 1 }
    });

    // Update submission author's average rating
    const authorSubmissions = await Submission.find({ author: submission.author });
    const authorTotalRating = authorSubmissions.reduce((sum, s) => sum + s.averageRating, 0);
    const authorAvgRating = authorTotalRating / authorSubmissions.length;
    
    await User.findByIdAndUpdate(submission.author, {
      averageRating: authorAvgRating
    });

    // Populate reviewer details
    await review.populate('reviewer', 'username email avatar reputation');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating review'
    });
  }
};

// @desc    Get reviews for a submission
// @route   GET /api/reviews/submission/:submissionId
// @access  Public
exports.getSubmissionReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ submission: req.params.submissionId })
      .populate('reviewer', 'username email avatar reputation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get submission reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};

// @desc    Get reviews by user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.params.userId })
      .populate('submission', 'title language')
      .populate('reviewer', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user reviews'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { rating, comment, codeSnippets } = req.body;

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (codeSnippets) review.codeSnippets = codeSnippets;

    await review.save();

    // Recalculate submission average rating
    const submission = await Submission.findById(review.submission);
    const allReviews = await Review.find({ submission: review.submission });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    submission.averageRating = totalRating / allReviews.length;
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating review'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const submissionId = review.submission;

    await review.deleteOne();

    // Remove review from submission and update counts
    const submission = await Submission.findById(submissionId);
    submission.reviews = submission.reviews.filter(r => r.toString() !== req.params.id);
    submission.reviewCount -= 1;

    // Recalculate average rating
    const remainingReviews = await Review.find({ submission: submissionId });
    if (remainingReviews.length > 0) {
      const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
      submission.averageRating = totalRating / remainingReviews.length;
    } else {
      submission.averageRating = 0;
      submission.status = 'pending';
    }

    await submission.save();

    // Update reviewer's review count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { reviewsGivenCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting review'
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    if (review.helpfulBy.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful'
      });
    }

    review.helpful += 1;
    review.helpfulBy.push(req.user.id);
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      helpful: review.helpful
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking review as helpful'
    });
  }
};