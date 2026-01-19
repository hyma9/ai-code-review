import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Zap, Bot, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/submit');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <div className="flex items-center justify-center mb-6">
          <Code2 className="w-16 h-16 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Improve Your Code with AI-Powered Reviews
        </h2>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Get instant, detailed feedback from our advanced AI reviewer. Submit your code and receive comprehensive analysis on code quality, security, performance, and best practices - completely free!
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            {isAuthenticated ? 'Submit Code Now' : 'Get Started Free'}
            <ArrowRight className="w-5 h-5" />
          </button>
          
          {/* {!isAuthenticated && (
            <Link
              to="/browse"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 text-lg font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
            >
              Browse Examples
            </Link>
          )} */}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Free forever • No credit card required • Instant AI feedback
        </p>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-12">
        {/* Feature 1 */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Instant AI Analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get detailed feedback on code quality, security concerns, performance optimizations, and best practices within seconds of submission.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Advanced AI Reviewer
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Powered by Groq's lightning-fast AI models, providing expert-level code reviews that help you write better, cleaner, and more secure code.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Learn & Improve
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Accelerate your programming skills with personalized AI feedback. Every review helps you become a better developer with actionable insights.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-12 my-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Submit Your Code
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Paste your code, add a description, and submit for review
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Analyzes Your Code
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI reviewer examines your code in seconds
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Get Detailed Feedback
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Receive comprehensive review with ratings and suggestions
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {/* <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Improve Your Code?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Join developers getting instant AI-powered code reviews
        </p>
        <button
          onClick={handleGetStarted}
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          {isAuthenticated ? 'Submit Code Now' : 'Get Started Free'}
        </button>
      </div> */}
    </div>
  );
};

export default Home;