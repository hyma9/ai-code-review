import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, MessageSquare, Star, Loader, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submissionsAPI, usersAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's submissions and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch user's submissions
        const submissionsRes = await submissionsAPI.getUserSubmissions(user.id);
        setSubmissions(submissionsRes.data.submissions || []);

        // Fetch user's stats
        const statsRes = await usersAPI.getStats(user.id);
        setStats(statsRes.data.stats);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDelete = async (submissionId, submissionTitle) => {
    // Confirm before deleting
    if (!window.confirm(`Are you sure you want to delete "${submissionTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(submissionId);
      
      // Call delete API
      await submissionsAPI.delete(submissionId);
      
      // Remove from local state
      setSubmissions(submissions.filter(sub => sub._id !== submissionId));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          submissionsCount: stats.submissionsCount - 1
        });
      }

      alert('Submission deleted successfully!');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (submissionId) => {
    navigate(`/submission/${submissionId}`);
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

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

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300">Total Submissions</span>
            <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.submissionsCount || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300">AI Reviews Received</span>
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {submissions.filter(s => s.reviewCount > 0).length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300">Average Rating</span>
            <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Submissions</h2>
        
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <Code2 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No submissions yet</p>
            <button
              onClick={() => navigate('/submit')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Your First Code
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div 
                key={submission._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {submission.title}
                      </h3>
                      {submission.isPrivate && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded flex items-center gap-1">
                          🔒 Private
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="capitalize">{submission.language}</span>
                      <span>•</span>
                      <span>{formatDate(submission.createdAt)}</span>
                      {submission.reviewCount > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current" />
                            <span>{submission.averageRating.toFixed(1)}</span>
                          </div>
                          <span>•</span>
                          <span>{submission.reviewCount} review{submission.reviewCount !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(submission.status)}`}>
                      {formatStatus(submission.status)}
                    </span>
                    
                    {/* View Button */}
                    <button
                      onClick={() => handleView(submission._id)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="View submission"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(submission._id, submission.title)}
                      disabled={deleteLoading === submission._id}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete submission"
                    >
                      {deleteLoading === submission._id ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;