import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  Target, 
  Calendar, 
  Users, 
  Briefcase, 
  Presentation, 
  Brain,
  ArrowRight,
  Clock,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');

  // Fetch user stats - using the same endpoint as Profile page
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => api.get('/users/stats').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch dashboard data for recent assessments and progress summary
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/users/dashboard').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const confidenceIssues = [
    { 
      id: 'public-speaking', 
      title: 'Public Speaking Anxiety', 
      icon: <Users size={24} />, 
      description: 'Overcome nervousness when speaking to groups',
      color: 'from-blue-500 to-purple-600'
    },
    { 
      id: 'interviewing', 
      title: 'Interview Confidence', 
      icon: <Briefcase size={24} />, 
      description: 'Ace your next job interview with confidence',
      color: 'from-green-500 to-blue-500'
    },
    { 
      id: 'pitch-ideas', 
      title: 'Pitching Ideas', 
      icon: <Presentation size={24} />, 
      description: 'Present your ideas with clarity and confidence',
      color: 'from-orange-500 to-red-500'
    },
    { 
      id: 'self-doubt', 
      title: 'Self-Doubt', 
      icon: <Brain size={24} />, 
      description: 'Overcome imposter syndrome and believe in yourself',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Helper function to calculate completion rate
  const getCompletionRate = () => {
    if (!userStats || userStats.total_assessments === 0) return 0;
    return Math.round((userStats.completed_assessments / userStats.total_assessments) * 100);
  };

  if (statsLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {greeting}, {user?.username}! 👋
            </h1>
            <p className="text-purple-100 text-lg">
              Ready to continue building your confidence? Let's see how you're progressing.
            </p>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>
      </motion.div>

      {/* Stats Cards - Now using userStats instead of dashboardData.user */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Assessments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {userStats?.total_assessments || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {userStats?.completed_assessments || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Progress Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {getCompletionRate()}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Start Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Start a New Assessment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {confidenceIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Link
                      to={`/assessments/new?type=${issue.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-200 relative overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${issue.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                      <div className="relative z-10">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${issue.color} text-white`}>
                            {issue.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 mb-1">
                              {issue.title}
                            </h3>
                            <p className="text-sm text-gray-600 group-hover:text-gray-700">
                              {issue.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Assessments */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Assessments</h2>
                <Link
                  to="/assessments"
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {dashboardData?.recent_assessments?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recent_assessments.slice(0, 3).map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          assessment.status === 'completed' 
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {assessment.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{assessment.issue_title}</h3>
                          <p className="text-sm text-gray-600">
                            {format(new Date(assessment.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                  <p className="text-gray-600 mb-4">Start your first confidence assessment to begin your journey</p>
                  <Link
                    to="/assessments/new"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Assessment
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Summary */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Strategies Tracked</span>
                  <span className="font-semibold text-gray-900">
                    {dashboardData?.progress_summary?.total_strategies_tracked || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">
                    {dashboardData?.progress_summary?.completed_strategies || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-yellow-600">
                    {dashboardData?.progress_summary?.in_progress_strategies || 0}
                  </span>
                </div>
              </div>

              {(dashboardData?.progress_summary?.total_strategies_tracked || 0) > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round((dashboardData.progress_summary.completed_strategies / dashboardData.progress_summary.total_strategies_tracked) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(dashboardData.progress_summary.completed_strategies / dashboardData.progress_summary.total_strategies_tracked) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Overview Card */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Journey</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Assessments Taken</span>
                  </div>
                  <span className="font-bold text-blue-600">{userStats?.total_assessments || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Successfully Completed</span>
                  </div>
                  <span className="font-bold text-green-600">{userStats?.completed_assessments || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Success Rate</span>
                  </div>
                  <span className="font-bold text-purple-600">{getCompletionRate()}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/assessments/new"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
                >
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-purple-700 group-hover:text-purple-800">
                    New Assessment
                  </span>
                </Link>
                
                <Link
                  to="/assessments"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-800">
                    View History
                  </span>
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Target className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-800">
                    Update Goals
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Motivational Quote */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-3">Daily Inspiration</h3>
              <blockquote className="text-indigo-100 italic mb-3">
                "Confidence is not about being perfect. It's about being brave enough to be yourself."
              </blockquote>
              <p className="text-xs text-indigo-200">— Confidence Buddy Team</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;