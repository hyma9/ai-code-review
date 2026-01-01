import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Code2, Star, MessageSquare, Eye, Calendar, Loader, ArrowLeft, Bot } from 'lucide-react';
import { submissionsAPI } from '../services/api';

const ViewSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionsAPI.getById(id);
      setSubmission(response.data.submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'in_review':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'pending':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-500 dark:text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Submission not found</h2>
        <button
          onClick={() => navigate('/browse')}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/browse')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Browse</span>
      </button>

      {/* Submission Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {submission.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {submission.description}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ml-4 ${getStatusColor(submission.status)}`}>
            {formatStatus(submission.status)}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <span className="font-medium capitalize">{submission.language}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{submission.reviewCount} review{submission.reviewCount !== 1 ? 's' : ''}</span>
          </div>
          {submission.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current" />
              <span>{submission.averageRating.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{submission.viewCount} view{submission.viewCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(submission.createdAt)}</span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-semibold">
            {submission.author?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {submission.author?.username || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Author
            </div>
          </div>
        </div>
      </div>

      {/* Code Block */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Code</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-gray-100 text-sm font-mono whitespace-pre-wrap break-words">
            {submission.code}
          </pre>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Reviews ({submission.reviews?.length || 0})
        </h2>

        {submission.reviews && submission.reviews.length > 0 ? (
          <div className="space-y-6">
            {submission.reviews.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.isAIReview ? (
                      <div className="w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {review.reviewer?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {review.isAIReview ? (
                          <span className="flex items-center gap-2">
                            AI Reviewer
                            <span className="text-xs font-normal text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
                              {review.aiModel}
                            </span>
                          </span>
                        ) : (
                          review.reviewer?.username || 'Anonymous'
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Review Comment */}
                <div className="prose prose-sm dark:prose-invert max-w-none ml-13">
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {review.comment}
                  </div>
                </div>

                {/* Review Actions */}
                <div className="flex items-center gap-4 mt-4 ml-13 text-sm">
                  <button className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    👍 Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {submission.status === 'pending' 
                ? 'AI review is being generated...' 
                : 'No reviews yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSubmission;