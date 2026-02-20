'use client';

import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DashboardContent() {
  const { user } = useAuth();
  const [stats] = useState({
    totalExams: 24,
    completed: 18,
    averageScore: 78,
    timeSpent: '45h 30m',
    streak: 7,
    rank: 'Top 15%'
  });

  const recentActivities = [
    { subject: 'Mathematics', score: 85, time: '2 hours ago', status: 'completed' },
    { subject: 'English Language', score: 72, time: 'Yesterday', status: 'completed' },
    { subject: 'Physics', score: 0, time: 'In progress', status: 'active' },
    { subject: 'Chemistry', score: 90, time: '3 days ago', status: 'completed' },
  ];

  const quickActions = [
    { title: 'Start New Exam', icon: '📝', color: 'from-blue-500 to-blue-600', action: '/dashboard/exams' },
    { title: 'Timed Practice', icon: '⏱️', color: 'from-green-500 to-green-600', action: '/dashboard/timed-tests' },
    { title: 'View Performance', icon: '📊', color: 'from-purple-500 to-purple-600', action: '/dashboard/performance' },
    { title: 'Past Questions', icon: '📚', color: 'from-orange-500 to-orange-600', action: '/dashboard/past-questions' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-blue-100">
              Continue your journey to excellence. {stats.completed} exams completed.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <span className="text-xl mr-2">🏆</span>
              <span>Current Rank: {stats.rank}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Exams', value: stats.totalExams, icon: '📚', color: 'blue' },
          { label: 'Completed', value: stats.completed, icon: '📈', color: 'green' },
          { label: 'Avg Score', value: `${stats.averageScore}%`, icon: '🎯', color: 'purple' },
          { label: 'Time Spent', value: stats.timeSpent, icon: '⏱️', color: 'orange' },
          { label: 'Day Streak', value: stats.streak, icon: '🔥', color: 'red' },
          { label: 'Global Rank', value: stats.rank, icon: '🏆', color: 'indigo' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-r ${action.color} text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-lg">{action.title}</h3>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.status === 'completed' ? '✓' : '▶️'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{activity.subject}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.score > 0 ? (
                    <span className="font-bold text-lg text-gray-800">{activity.score}%</span>
                  ) : (
                    <span className="text-sm text-blue-600 font-medium">Continue →</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Exams */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Practice</h2>
          <div className="space-y-4">
            {[
              { subject: 'Biology', date: 'Tomorrow', duration: '2h 30m' },
              { subject: 'Economics', date: 'Dec 15', duration: '2h' },
              { subject: 'Geography', date: 'Dec 18', duration: '1h 45m' },
              { subject: 'Government', date: 'Dec 20', duration: '2h 15m' },
            ].map((exam, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                <div>
                  <p className="font-medium text-gray-800">{exam.subject}</p>
                  <p className="text-sm text-gray-500">{exam.date} • {exam.duration}</p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium">
                  Schedule
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}