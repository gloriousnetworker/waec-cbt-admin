// components/dashboard-content/Home.jsx
'use client';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  homeContainer,
  homeHeader,
  homeTitle,
  homeSubtitle,
  homeStatsGrid,
  homeStatCard,
  homeStatCardTop,
  homeStatCardIcon,
  homeStatCardValue,
  homeStatCardLabel,
  homeActionsGrid,
  homeActionButton,
  homeActionIcon,
  homeActionTitle,
  homeContentGrid,
  homeCard,
  homeCardTitle,
  homeSubjectGrid,
  homeSubjectButton,
  homeSubjectInner,
  homeSubjectIcon,
  homeSubjectName,
  homeSubjectCount,
  homeBanner,
  homeBannerContent,
  homeBannerTitle,
  homeBannerText,
  homeBannerActions,
  homeBannerButtonPrimary,
  homeBannerButtonSecondary,
  homeBannerStats,
  homeBannerStatItem,
  homeBannerStatValue,
  homeBannerStatLabel
} from '../styles';

export default function DashboardHome({ setActiveSection }) {
  const { user, fetchWithAuth } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsInExamMode: 0,
    totalExams: 0,
    averageScore: 0,
    openTickets: 0,
    totalSubjects: 0,
    totalQuestions: 0,
    passRate: 0
  });
  const [recentExams, setRecentExams] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({ active: false, reason: '' });
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchSubscriptionStatus();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetchWithAuth('/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalStudents: data.stats?.totalStudents || 0,
          studentsInExamMode: data.stats?.studentsInExamMode || 0,
          totalExams: data.stats?.totalExams || 0,
          averageScore: Math.round(data.stats?.averageScore || 0),
          openTickets: data.stats?.openTickets || 0,
          totalSubjects: data.totalSubjects || 0,
          totalQuestions: data.totalQuestions || 0,
          passRate: Math.round(data.stats?.passRate || 0)
        });
        setRecentExams(data.recentExams || []);
        setSubjectPerformance(data.subjectPerformance || {});
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetchWithAuth('/admin/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data.status || { active: false });
        setSubscription(data.subscription);
        
        if (data.subscription?.expiryDate) {
          const expiry = data.subscription.expiryDate._seconds 
            ? new Date(data.subscription.expiryDate._seconds * 1000)
            : new Date(data.subscription.expiryDate);
          const now = new Date();
          const diffTime = expiry - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(diffDays > 0 ? diffDays : 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const quickActions = [
    { title: 'Add New Student', icon: '👤', color: 'border-[#10b981] text-[#10b981] hover:bg-[#F0FDF4]', action: () => setActiveSection('students') },
    { title: 'Create Subject', icon: '📚', color: 'border-[#10b981] text-[#10b981] hover:bg-[#F0FDF4]', action: () => setActiveSection('subjects') },
    { title: 'Add Questions', icon: '❓', color: 'border-[#10b981] text-[#10b981] hover:bg-[#F0FDF4]', action: () => setActiveSection('questions') },
    { title: 'Setup Exam', icon: '📝', color: 'border-[#10b981] text-[#10b981] hover:bg-[#F0FDF4]', action: () => setActiveSection('exams') },
    { title: 'Support Tickets', icon: '🎫', color: 'border-[#10b981] text-[#10b981] hover:bg-[#F0FDF4]', action: () => setActiveSection('support') },
  ];

  if (loading) {
    return (
      <div className={homeContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={homeContainer}>
      <div className={homeHeader}>
        <h1 className={homeTitle}>
          Welcome back, {user?.name || 'Admin'}! 👋
        </h1>
        <p className={homeSubtitle}>
          {stats.totalStudents} students • {stats.totalSubjects} subjects • {stats.openTickets} pending tickets
        </p>
        
        {/* Subscription Status Banner */}
        {subscription && (
          <div className={`mt-4 p-4 rounded-lg ${
            subscriptionStatus.active 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {subscriptionStatus.active ? (
                  <span className="text-2xl">✅</span>
                ) : (
                  <span className="text-2xl">⚠️</span>
                )}
                <div>
                  <p className={`text-sm font-[600] ${
                    subscriptionStatus.active ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {subscriptionStatus.active ? 'Active Subscription' : 'No Active Subscription'}
                  </p>
                  {subscriptionStatus.active ? (
                    <p className="text-xs text-green-600 mt-1">
                      Plan: {subscription?.plan} • Expires: {formatDate(subscription?.expiryDate)} • {daysRemaining} days remaining
                    </p>
                  ) : (
                    <p className="text-xs text-yellow-600 mt-1">
                      {subscriptionStatus.reason || 'Please activate your subscription to continue'}
                    </p>
                  )}
                </div>
              </div>
              {!subscriptionStatus.active && (
                <button
                  onClick={() => setActiveSection('subscription')}
                  className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm font-[600]"
                >
                  Activate Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={homeStatsGrid}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>👥</span>
            <span className={homeStatCardValue}>{stats.totalStudents}</span>
          </div>
          <p className={homeStatCardLabel}>Total Students</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>⚡</span>
            <span className={homeStatCardValue}>{stats.studentsInExamMode}</span>
          </div>
          <p className={homeStatCardLabel}>In Exam Mode</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>📚</span>
            <span className={homeStatCardValue}>{stats.totalExams}</span>
          </div>
          <p className={homeStatCardLabel}>Exams Taken</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>📊</span>
            <span className={homeStatCardValue}>{stats.averageScore}%</span>
          </div>
          <p className={homeStatCardLabel}>Average Score</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>🎫</span>
            <span className={homeStatCardValue}>{stats.openTickets}</span>
          </div>
          <p className={homeStatCardLabel}>Open Tickets</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>✅</span>
            <span className={homeStatCardValue}>{stats.passRate}%</span>
          </div>
          <p className={homeStatCardLabel}>Pass Rate</p>
        </motion.div>
      </div>

      <div className={homeActionsGrid}>
        {quickActions.map((action, index) => (
          <motion.button
            key={action.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className={`${homeActionButton} ${action.color}`}
          >
            <div className={homeActionIcon}>{action.icon}</div>
            <h3 className={homeActionTitle}>{action.title}</h3>
          </motion.button>
        ))}
      </div>

      <div className={homeContentGrid}>
        <div className={homeCard}>
          <h2 className={homeCardTitle}>Quick Access</h2>
          <div className={homeSubjectGrid}>
            <button onClick={() => setActiveSection('students')} className={homeSubjectButton}>
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>👥</span>
                <div>
                  <div className={homeSubjectName}>Student Registration</div>
                  <div className={homeSubjectCount}>Add new students</div>
                </div>
              </div>
            </button>
            <button onClick={() => setActiveSection('subjects')} className={homeSubjectButton}>
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>📚</span>
                <div>
                  <div className={homeSubjectName}>Subjects</div>
                  <div className={homeSubjectCount}>Manage subjects</div>
                </div>
              </div>
            </button>
            <button onClick={() => setActiveSection('questions')} className={homeSubjectButton}>
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>❓</span>
                <div>
                  <div className={homeSubjectName}>Question Bank</div>
                  <div className={homeSubjectCount}>Add questions</div>
                </div>
              </div>
            </button>
            <button onClick={() => setActiveSection('exams')} className={homeSubjectButton}>
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>📝</span>
                <div>
                  <div className={homeSubjectName}>Exam Setup</div>
                  <div className={homeSubjectCount}>Create new exams</div>
                </div>
              </div>
            </button>
            <button onClick={() => setActiveSection('results')} className={homeSubjectButton}>
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>📊</span>
                <div>
                  <div className={homeSubjectName}>Exam Results</div>
                  <div className={homeSubjectCount}>View performance</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {recentExams.length > 0 && (
          <div className={homeCard}>
            <h2 className={homeCardTitle}>Recent Exams</h2>
            <div className="space-y-3">
              {recentExams.map((exam, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-[13px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">{exam.subject}</p>
                    <p className="text-[10px] leading-[100%] font-[400] text-[#626060] mt-1 font-playfair">
                      Student: {exam.studentName} • Score: {exam.score}%
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] leading-[100%] font-[500] ${
                    exam.score >= 70 ? 'bg-green-100 text-green-600' : 
                    exam.score >= 50 ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-red-100 text-red-600'
                  }`}>
                    {exam.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={homeBanner}>
        <div className={homeBannerContent}>
          <div>
            <h3 className={homeBannerTitle}>Need Technical Support?</h3>
            <p className={homeBannerText}>
              Our team is ready to help you with any issues or questions.
            </p>
          </div>
          <div className={homeBannerActions}>
            <button onClick={() => setActiveSection('support')} className={homeBannerButtonPrimary}>
              Create Support Ticket
            </button>
            <button onClick={() => window.open('mailto:support@kogistate.edu.ng')} className={homeBannerButtonSecondary}>
              Email Support
            </button>
          </div>
        </div>
        
        <div className={homeBannerStats}>
          <div className={homeBannerStatItem}>
            <div className={homeBannerStatValue}>24/7</div>
            <div className={homeBannerStatLabel}>Support Available</div>
          </div>
          <div className={homeBannerStatItem}>
            <div className={homeBannerStatValue}>2h</div>
            <div className={homeBannerStatLabel}>Avg Response</div>
          </div>
          <div className={homeBannerStatItem}>
            <div className={homeBannerStatValue}>98%</div>
            <div className={homeBannerStatLabel}>Satisfaction</div>
          </div>
          <div className={homeBannerStatItem}>
            <div className={homeBannerStatValue}>Kogi State</div>
            <div className={homeBannerStatLabel}>College</div>
          </div>
        </div>
      </div>
    </div>
  );
}