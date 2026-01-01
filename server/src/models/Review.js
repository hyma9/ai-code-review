// const mongoose = require('mongoose');

// const reviewSchema = new mongoose.Schema({
//   submission: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Submission',
//     required: true
//   },
//   reviewer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   rating: {
//     type: Number,
//     required: [true, 'Rating is required'],
//     min: 1,
//     max: 5
//   },
//   comment: {
//     type: String,
//     required: [true, 'Comment is required'],
//     maxlength: [2000, 'Comment cannot exceed 2000 characters']
//   },
//   codeSnippets: [{
//     lineNumber: Number,
//     suggestion: String
//   }],
//   helpful: {
//     type: Number,
//     default: 0
//   },
//   helpfulBy: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }]
// }, {
//   timestamps: true
// });

// // Index for better query performance
// reviewSchema.index({ submission: 1, createdAt: -1 });
// reviewSchema.index({ reviewer: 1 });

// module.exports = mongoose.model('Review', reviewSchema);


const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Changed to false to allow AI reviews (no user)
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [5000, 'Comment cannot exceed 5000 characters'] // Increased for AI reviews
  },
  // AI Review fields
  isAIReview: {
    type: Boolean,
    default: false
  },
  aiModel: {
    type: String,
    default: null // e.g., "llama-3.3-70b-versatile"
  },
  // Original fields
  codeSnippets: [{
    lineNumber: Number,
    suggestion: String
  }],
  helpful: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for better query performance
reviewSchema.index({ submission: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ isAIReview: 1 });

module.exports = mongoose.model('Review', reviewSchema);