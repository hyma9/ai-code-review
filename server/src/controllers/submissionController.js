const Submission = require('../models/Submission');
const Review = require('../models/Review');
const User = require('../models/User');
const { generateAIReview } = require('../services/aiReviewService');

// @desc    Create new submission
// @route   POST /api/submissions
// @access  Private
exports.createSubmission = async (req, res) => {
  try {
    const { title, description, code, language, isPrivate } = req.body;

    // Validation
    if (!title || !description || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create submission
    const submission = await Submission.create({
      title,
      description,
      code,
      language,
      isPrivate: isPrivate || false, // Add privacy field
      author: req.user.id
    });

    // Update user's submission count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { submissionsCount: 1 }
    });

    // Generate AI review asynchronously (don't wait for it)
    generateAIReview(code, language, title, description)
      .then(async (aiReview) => {
        // Create AI review
        const review = await Review.create({
          submission: submission._id,
          reviewer: null, // AI has no user
          rating: aiReview.rating,
          comment: aiReview.comment,
          isAIReview: true,
          aiModel: 'llama-3.3-70b-versatile'
        });

        // Update submission with review
        await Submission.findByIdAndUpdate(submission._id, {
          $push: { reviews: review._id },
          $inc: { reviewCount: 1 },
          $set: { 
            averageRating: aiReview.rating,
            status: 'reviewed'
          }
        });

        console.log(`✅ AI review generated for submission: ${submission._id}`);
      })
      .catch((error) => {
        console.error('❌ Failed to generate AI review:', error);
        // Don't fail the submission if AI review fails
      });

    res.status(201).json({
      success: true,
      message: 'Code submitted successfully! AI review is being generated...',
      submission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating submission'
    });
  }
};

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Public
exports.getAllSubmissions = async (req, res) => {
  try {
    const { language, status, search } = req.query;
    
    let query = { isPrivate: false }; // Only show public submissions
    
    // Filter by language
    if (language && language !== 'all') {
      query.language = language;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const submissions = await Submission.find(query)
      .populate('author', 'username avatar reputation')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching submissions'
    });
  }
};

// @desc    Get single submission with reviews
// @route   GET /api/submissions/:id
// @access  Public
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('author', 'username avatar reputation bio')
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'username avatar reputation'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Increment view count
    submission.viewCount += 1;
    await submission.save();

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching submission'
    });
  }
};

// @desc    Get user's submissions
// @route   GET /api/submissions/user/:userId
// @access  Public
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ author: req.params.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user submissions'
    });
  }
};

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private (Author only)
exports.updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user is the author
    if (submission.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this submission'
      });
    }

    const { title, description, code, language, status } = req.body;

    if (title) submission.title = title;
    if (description) submission.description = description;
    if (code) submission.code = code;
    if (language) submission.language = language;
    if (status) submission.status = status;

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission updated successfully',
      submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating submission'
    });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Author only)
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user is the author
    if (submission.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }

    // Delete all reviews for this submission
    await Review.deleteMany({ submission: submission._id });

    // Delete submission
    await submission.deleteOne();

    // Update user's submission count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { submissionsCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting submission'
    });
  }
};