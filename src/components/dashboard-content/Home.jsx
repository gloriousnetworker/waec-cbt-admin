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
  homeActivityItem,
  homeActivityLeft,
  homeActivityIcon,
  homeActivitySubject,
  homeActivityTime,
  homeActivityContinue,
  homeSubjectGrid,
  homeSubjectButton,
  homeSubjectInner,
  homeSubjectIcon,
  homeSubjectName,
  homeSubjectCount,
  homeViewAllButton,
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
    activeToday: 0,
    avgPerformance: 0,
    pendingTickets: 0,
    completedExams: 0,
    passRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, ticketsRes] = await Promise.all([
        fetchWithAuth('/admin/students'),
        fetchWithAuth('/admin/tickets')
      ]);

      const studentsData = await studentsRes.json();
      const ticketsData = await ticketsRes.json();

      const students = studentsData.students || [];
      const tickets = ticketsData.tickets || [];
      
      const total = students.length;
      const active = students.filter(s => s.status === 'active').length;
      const pendingTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
      
      setStats({
        totalStudents: total,
        activeToday: active,
        avgPerformance: 0,
        pendingTickets: pendingTickets,
        completedExams: 0,
        passRate: 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Add New Student', icon: '👤', color: 'border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]', action: () => setActiveSection('students') },
    { title: 'View Performance', icon: '📊', color: 'border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]', action: () => setActiveSection('performance') },
    { title: 'Support Tickets', icon: '🎫', color: 'border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#EDE9FE]', action: () => setActiveSection('support') },
    { title: 'Generate Reports', icon: '📑', color: 'border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]', action: () => setActiveSection('results') },
  ];

  return (
    <div className={homeContainer}>
      <div className={homeHeader}>
        <h1 className={homeTitle}>
          Welcome back, {user?.name || 'Admin'}! 👋
        </h1>
        <p className={homeSubtitle}>
          {stats.totalStudents} students enrolled • {stats.pendingTickets} pending support tickets
        </p>
      </div>

      <div className={homeStatsGrid}>
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: '👥' },
          { label: 'Active Today', value: stats.activeToday, icon: '⚡' },
          { label: 'Avg Performance', value: `${stats.avgPerformance}%`, icon: '📈' },
          { label: 'Pending Tickets', value: stats.pendingTickets, icon: '🎫' },
          { label: 'Exams Taken', value: stats.completedExams, icon: '📚' },
          { label: 'Pass Rate', value: `${stats.passRate}%`, icon: '✅' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={homeStatCard}
          >
            <div className={homeStatCardTop}>
              <span className={homeStatCardIcon}>{stat.icon}</span>
              <span className={homeStatCardValue}>{stat.value}</span>
            </div>
            <p className={homeStatCardLabel}>{stat.label}</p>
          </motion.div>
        ))}
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
            <button
              onClick={() => setActiveSection('students')}
              className={homeSubjectButton}
            >
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>👥</span>
                <div>
                  <div className={homeSubjectName}>Student Registration</div>
                  <div className={homeSubjectCount}>Add new students</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('results')}
              className={homeSubjectButton}
            >
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>📊</span>
                <div>
                  <div className={homeSubjectName}>Exam Results</div>
                  <div className={homeSubjectCount}>View reports</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('support')}
              className={homeSubjectButton}
            >
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>🎫</span>
                <div>
                  <div className={homeSubjectName}>Support Tickets</div>
                  <div className={homeSubjectCount}>{stats.pendingTickets} pending</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className={homeSubjectButton}
            >
              <div className={homeSubjectInner}>
                <span className={homeSubjectIcon}>⚙️</span>
                <div>
                  <div className={homeSubjectName}>Settings</div>
                  <div className={homeSubjectCount}>Configure school</div>
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
            <button
              onClick={() => setActiveSection('support')}
              className={homeBannerButtonPrimary}
            >
              Create Support Ticket
            </button>
            <button
              onClick={() => window.open('mailto:support@megatechsolutions.org')}
              className={homeBannerButtonSecondary}
            >
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