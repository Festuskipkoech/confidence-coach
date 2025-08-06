import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Globe, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  Star
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import useAuthStore from '../store/authStore';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    country: user?.country || '',
  });


const { data: userStats, isLoading: statsLoading } = useQuery({
  queryKey: ['user-stats'],
  queryFn: () => api.get('/users/stats').then(res => res.data),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => api.get('/users/dashboard').then(res => res.data),
  staleTime: 5 * 60 * 1000,
});

const updateProfileMutation = useMutation({
  mutationFn: (data) => api.patch('/users/profile', data),
  onSuccess: (response) => {
    updateUser(response.data);
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    toast.success('Profile updated successfully! 🎉');
    setIsEditing(false);
  },
  onError: (error) => {
    toast.error('Failed to update profile');
  }
});

  const handleSaveProfile = () => {
    if (!editData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!editData.country.trim()) {
      toast.error('Country is required');
      return;
    }

    updateProfileMutation.mutate(editData);
  };

  const handleCancelEdit = () => {
    setEditData({
      username: user?.username || '',
      country: user?.country || '',
    });
    setIsEditing(false);
  };

  const countries = [
    'Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Uganda', 'Tanzania', 'Rwanda',
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
    'India', 'Brazil', 'Mexico', 'Japan', 'China', 'Other'
  ];

  // Helper function to calculate completion rate
  const getCompletionRate = () => {
    if (!userStats || userStats.total_assessments === 0) return 0;
    return Math.round((userStats.completed_assessments / userStats.total_assessments) * 100);
  };

  // Achievement data
  const achievements = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first assessment',
      icon: Trophy,
      achieved: (userStats?.total_assessments || 0) > 0,
      color: 'purple'
    },
    {
      id: 'committed-learner',
      title: 'Committed Learner',
      description: 'Complete 3 assessments',
      icon: Target,
      achieved: (userStats?.completed_assessments || 0) >= 3,
      progress: `${userStats?.completed_assessments || 0}/3`,
      color: 'green'
    },
    {
      id: 'well-rounded',
      title: 'Well-Rounded',
      description: 'Try all confidence areas',
      icon: BarChart3,
      achieved: Object.keys(userStats?.issue_type_breakdown || {}).length >= 4,
      progress: `${Object.keys(userStats?.issue_type_breakdown || {}).length}/4`,
      color: 'blue'
    },
    {
      id: 'high-achiever',
      title: 'High Achiever',
      description: '80% completion rate',
      icon: TrendingUp,
      achieved: getCompletionRate() >= 80,
      progress: `${getCompletionRate()}%`,
      color: 'yellow'
    }
  ];

  const getAchievementColor = (color, achieved) => {
    const colors = {
      purple: achieved ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-500',
      green: achieved ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500',
      blue: achieved ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-500',
      yellow: achieved ? 'border-yellow-200 bg-yellow-50 text-yellow-700' : 'border-gray-200 bg-gray-50 text-gray-500'
    };
    return colors[color];
  };

  const getAchievementIconColor = (color, achieved) => {
    const colors = {
      purple: achieved ? 'bg-purple-600 text-white' : 'bg-gray-400 text-white',
      green: achieved ? 'bg-green-600 text-white' : 'bg-gray-400 text-white',
      blue: achieved ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white',
      yellow: achieved ? 'bg-yellow-600 text-white' : 'bg-gray-400 text-white'
    };
    return colors[color];
  };

  const issueTypeNames = {
    'public-speaking': 'Public Speaking',
    'interviewing': 'Interview Confidence',
    'pitch-ideas': 'Pitching Ideas',
    'self-doubt': 'Self-Doubt'
  };

  if (statsLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account and view your confidence journey</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Section */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              {!isEditing ? (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-medium text-gray-900">{user?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-medium text-gray-900">{user?.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium text-gray-900">
                        {user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center shadow-lg"
                  >
                    <Edit3 className="w-5 h-5 mr-2" />
                    Edit Profile
                  </motion.button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({...editData, username: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={editData.country}
                      onChange={(e) => setEditData({...editData, country: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select your country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isLoading}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-70"
                    >
                      {updateProfileMutation.isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats and Activity Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Assessments</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
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
                    <p className="text-2xl font-bold text-gray-900 mt-1">
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
                    <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {getCompletionRate()}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progress by Issue Type */}
          {userStats?.issue_type_breakdown && Object.keys(userStats.issue_type_breakdown).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress by Confidence Area</h3>
              <div className="space-y-4">
                {Object.entries(userStats.issue_type_breakdown).map(([issueType, stats]) => {
                  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                  
                  return (
                    <div key={issueType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {issueTypeNames[issueType] || issueType}
                          </h4>
                          <span className="text-sm text-gray-600">
                            {stats.completed}/{stats.total} completed
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            
            {dashboardData?.recent_assessments?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recent_assessments.slice(0, 5).map((assessment) => (
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
                        <h4 className="font-medium text-gray-900">{assessment.issue_title}</h4>
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
                <h4 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h4>
                <p className="text-gray-600">Start your first assessment to see your activity here</p>
              </div>
            )}
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${getAchievementColor(achievement.color, achievement.achieved)}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getAchievementIconColor(achievement.color, achievement.achieved)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      {achievement.achieved ? (
                        <div className="text-xs font-medium flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Achieved!
                        </div>
                      ) : (
                        achievement.progress && (
                          <div className="text-xs text-gray-600">
                            Progress: {achievement.progress}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Monthly Activity Summary */}
          {userStats?.recent_activity && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white"
            >
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">This Month's Activity</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="font-medium mb-2">New Assessments</h4>
                  <p className="text-2xl font-bold">
                    {userStats.recent_activity.assessments_last_30_days || 0}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="font-medium mb-2">Progress Updates</h4>
                  <p className="text-2xl font-bold">
                    {userStats.recent_activity.progress_updates_last_30_days || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;