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
    activeStudents: 0,
    totalSubjects: 0,
    totalQuestions: 0,
    totalExams: 0,
    avgPerformance: 0,
    pendingTickets: 0,
    completedExams: 0,
    passRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetchWithAuth('/admin/dashboard/stats');
      const data = await response.json();
      setStats({
        totalStudents: data.stats?.totalStudents || 0,
        activeStudents: data.stats?.activeStudents || 0,
        totalSubjects: data.stats?.totalSubjects || 0,
        totalQuestions: data.stats?.totalQuestions || 0,
        totalExams: data.stats?.totalExams || 0,
        avgPerformance: Math.round(data.stats?.averageScore || 0),
        pendingTickets: data.stats?.openTickets || 0,
        completedExams: data.stats?.totalExams || 0,
        passRate: Math.round(data.stats?.passRate || 0)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Add New Student', icon: '👤', color: 'border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]', action: () => setActiveSection('students') },
    { title: 'Create Subject', icon: '📚', color: 'border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]', action: () => setActiveSection('subjects') },
    { title: 'Add Questions', icon: '❓', color: 'border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#EDE9FE]', action: () => setActiveSection('questions') },
    { title: 'Support Tickets', icon: '🎫', color: 'border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]', action: () => setActiveSection('support') },
  ];

  return (
    <div className={homeContainer}>
      <div className={homeHeader}>
        <h1 className={homeTitle}>
          Welcome back, {user?.name || 'Admin'}! 👋
        </h1>
        <p className={homeSubtitle}>
          {stats.totalStudents} students • {stats.totalSubjects} subjects • {stats.pendingTickets} pending tickets
        </p>
      </div>

      <div className={homeStatsGrid}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>👥</span>
            <span className={homeStatCardValue}>{stats.totalStudents}</span>
          </div>
          <p className={homeStatCardLabel}>Total Students</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>⚡</span>
            <span className={homeStatCardValue}>{stats.activeStudents}</span>
          </div>
          <p className={homeStatCardLabel}>Active Students</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>📚</span>
            <span className={homeStatCardValue}>{stats.totalSubjects}</span>
          </div>
          <p className={homeStatCardLabel}>Subjects</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>❓</span>
            <span className={homeStatCardValue}>{stats.totalQuestions}</span>
          </div>
          <p className={homeStatCardLabel}>Questions</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>📊</span>
            <span className={homeStatCardValue}>{stats.avgPerformance}%</span>
          </div>
          <p className={homeStatCardLabel}>Avg Performance</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>🎫</span>
            <span className={homeStatCardValue}>{stats.pendingTickets}</span>
          </div>
          <p className={homeStatCardLabel}>Pending Tickets</p>
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
            <button onClick={() => window.open('mailto:support@megatechsolutions.org')} className={homeBannerButtonSecondary}>
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
            <div className={homeBannerStatValue}>Mega Tech</div>
            <div className={homeBannerStatLabel}>Solutions</div>
          </div>
        </div>
      </div>
    </div>
  );
}