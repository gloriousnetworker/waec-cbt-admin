// components/dashboard-content/Home.jsx
'use client';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  homeContainer,
  homeHeader,
  homeTitle,
  homeSubtitle,
  homeStatsGrid,
  homeStatCard,
  homeStatCardTop,
  homeStatCardIconWrap,
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
  homeBannerStatLabel,
} from '../../styles/styles';

// ── KPI stat card gradients ───────────────────────────────────────────────────
const STAT_GRADIENTS = [
  'linear-gradient(135deg, #1F2A49 0%, #2d3f6b 100%)',  // Total Students
  'linear-gradient(135deg, #1F2A49 0%, #0e7490 100%)',  // In Exam Mode
  'linear-gradient(135deg, #1F2A49 0%, #3A4F7A 100%)',  // Total Exams
  'linear-gradient(135deg, #059669 0%, #1F2A49 100%)',  // Average Score
  'linear-gradient(135deg, #D97706 0%, #1F2A49 100%)',  // Open Tickets
  'linear-gradient(135deg, #1F2A49 0%, #059669 100%)',  // Pass Rate
  'linear-gradient(135deg, #7C3AED 0%, #1F2A49 100%)',  // Student Limit
  'linear-gradient(135deg, #1F2A49 0%, #7C3AED 100%)',  // Remaining Slots
];

// ── Quick action colour sets ──────────────────────────────────────────────────
const ACTION_STYLES = [
  'border-brand-primary text-brand-primary hover:bg-brand-primary-lt',
  'border-brand-primary text-brand-primary hover:bg-brand-primary-lt',
  'border-brand-primary text-brand-primary hover:bg-brand-primary-lt',
  'border-brand-primary text-brand-primary hover:bg-brand-primary-lt',
  'border-warning text-warning-dark hover:bg-warning-light',
];

// ── Helper: score colour class ────────────────────────────────────────────────
const getScoreBadgeClass = (percentage) => {
  if (percentage >= 70) return 'bg-success-light text-success-dark';
  if (percentage >= 50) return 'bg-warning-light text-warning-dark';
  return 'bg-danger-light text-danger-dark';
};

// ── Helper: status badge ──────────────────────────────────────────────────────
const getStatusBadge = (status) => {
  if (status === 'completed') return { text: 'Completed', cls: 'bg-success-light text-success-dark' };
  if (status === 'in_progress') return { text: 'In Progress', cls: 'bg-blue-50 text-blue-700' };
  return { text: status || 'Unknown', cls: 'bg-surface-subtle text-content-muted' };
};

// ── Helper: progress bar colour ───────────────────────────────────────────────
const getProgressBarColor = (avg) => {
  if (avg >= 70) return '#059669';
  if (avg >= 50) return '#D97706';
  return '#DC2626';
};

export default function DashboardHome({ setActiveSection }) {
  const { user, fetchWithAuth } = useAuth();

  // ── State ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsInExamMode: 0,
    totalExams: 0,
    averageScore: 0,
    openTickets: 0,
    passRate: 0,
  });
  const [subscription, setSubscription] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // ── Fetch dashboard stats (single endpoint) ──────────────────────────────
  const fetchDashboardStats = useCallback(async () => {
    setStatsError(false);
    try {
      const response = await fetchWithAuth('/admin/dashboard/stats');

      if (response.ok) {
        const data = await response.json();

        // Stats
        setStats({
          totalStudents:      data.stats?.totalStudents      || 0,
          studentsInExamMode: data.stats?.studentsInExamMode || 0,
          totalExams:         data.stats?.totalExams         || 0,
          averageScore:       Math.round(data.stats?.averageScore || 0),
          openTickets:        data.stats?.openTickets        || 0,
          passRate:           Math.round(data.stats?.passRate || 0),
        });

        // Subscription
        if (data.subscription) {
          setSubscription(data.subscription);
        }

        // Recent exams
        setRecentExams(data.recentExams || []);

        // Subject performance
        setSubjectPerformance(data.subjectPerformance || {});
      } else {
        console.error('Dashboard stats error:', response.status, await response.text().catch(() => ''));
        setStatsError(true);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setStatsError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // ── Derived values ────────────────────────────────────────────────────────
  const subscriptionActive = subscription?.active ?? false;
  const daysRemaining      = subscription?.daysLeft ?? 0;
  const studentLimit       = subscription?.studentLimit ?? 0;
  const studentCount       = subscription?.studentCount ?? 0;
  const remainingStudents  = subscription?.remainingStudents ?? 0;

  // Compute completed / in-progress counts from recentExams
  const examBreakdown = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let autoSubmitted = 0;
    let totalTabSwitches = 0;
    let highestScore = 0;
    let lowestScore = 100;
    let totalDuration = 0;
    let completedWithDuration = 0;

    recentExams.forEach((exam) => {
      if (exam.status === 'completed') {
        completed++;
        if (exam.autoSubmitted) autoSubmitted++;
        if (exam.percentage > highestScore) highestScore = exam.percentage;
        if (exam.percentage < lowestScore) lowestScore = exam.percentage;

        // Calculate duration from startTime to endTime
        if (exam.startTime && exam.endTime) {
          const start = exam.startTime._seconds || Math.floor(new Date(exam.startTime).getTime() / 1000);
          const end = exam.endTime._seconds || Math.floor(new Date(exam.endTime).getTime() / 1000);
          const durationMins = Math.round((end - start) / 60);
          if (durationMins > 0) {
            totalDuration += durationMins;
            completedWithDuration++;
          }
        }
      } else {
        inProgress++;
      }
      totalTabSwitches += exam.tabSwitches || 0;
    });

    if (recentExams.length === 0) lowestScore = 0;

    return {
      completed,
      inProgress,
      autoSubmitted,
      totalTabSwitches,
      highestScore,
      lowestScore,
      avgDuration: completedWithDuration > 0 ? Math.round(totalDuration / completedWithDuration) : 0,
    };
  }, [recentExams]);

  // Subject performance entries (filter out 'undefined' key)
  const subjectPerfEntries = useMemo(() => {
    return Object.entries(subjectPerformance)
      .filter(([key]) => key !== 'undefined')
      .map(([name, data]) => ({
        name,
        average: Math.round(data.average * 100) / 100,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [subjectPerformance]);

  // ── Stat cards ────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Students',  value: stats.totalStudents,      icon: '👥', gradient: STAT_GRADIENTS[0] },
    { label: 'In Exam Mode',    value: stats.studentsInExamMode, icon: '⚡', gradient: STAT_GRADIENTS[1] },
    { label: 'Exams Taken',     value: stats.totalExams,         icon: '📚', gradient: STAT_GRADIENTS[2] },
    { label: 'Average Score',   value: `${stats.averageScore}%`, icon: '📊', gradient: STAT_GRADIENTS[3] },
    { label: 'Open Tickets',    value: stats.openTickets,        icon: '🎫', gradient: STAT_GRADIENTS[4] },
    { label: 'Pass Rate',       value: `${stats.passRate}%`,     icon: '✅', gradient: STAT_GRADIENTS[5] },
    { label: 'Student Limit',   value: studentLimit,             icon: '🎓', gradient: STAT_GRADIENTS[6] },
    { label: 'Slots Remaining', value: remainingStudents,        icon: '📋', gradient: STAT_GRADIENTS[7] },
  ];

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickActions = [
    { title: 'Add Student',    icon: '👤', action: () => setActiveSection('students') },
    { title: 'Create Subject', icon: '📚', action: () => setActiveSection('subjects') },
    { title: 'Add Questions',  icon: '❓', action: () => setActiveSection('questions') },
    { title: 'Setup Exam',     icon: '📝', action: () => setActiveSection('exams') },
    { title: 'View Tickets',   icon: '🎫', action: () => setActiveSection('support') },
  ];

  // ── Date formatter ────────────────────────────────────────────────────────
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const d = timestamp._seconds
      ? new Date(timestamp._seconds * 1000)
      : new Date(timestamp);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const d = timestamp._seconds
      ? new Date(timestamp._seconds * 1000)
      : new Date(timestamp);
    return d.toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={homeContainer}>
        <div className={homeStatsGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton rounded-xl h-28" />
          ))}
        </div>
        <div className={homeActionsGrid}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton rounded-xl h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="skeleton rounded-xl h-64" />
          <div className="skeleton rounded-xl h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className={homeContainer}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={homeHeader}>
        <h1 className={homeTitle}>
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👋
        </h1>
        <p className={homeSubtitle}>
          {stats.totalStudents} student{stats.totalStudents !== 1 ? 's' : ''} &nbsp;·&nbsp;{' '}
          {stats.totalExams} exam{stats.totalExams !== 1 ? 's' : ''} taken &nbsp;·&nbsp;{' '}
          {stats.openTickets} pending ticket{stats.openTickets !== 1 ? 's' : ''}
        </p>

        {/* ── Subscription banner ───────────────────────────────────────── */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
              subscriptionActive
                ? 'bg-success-light border-success/30'
                : 'bg-warning-light border-warning/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{subscriptionActive ? '✅' : '⚠️'}</span>
              <div>
                <p className={`text-sm font-semibold ${subscriptionActive ? 'text-success-dark' : 'text-warning-dark'}`}>
                  {subscriptionActive ? 'Active Subscription' : 'No Active Subscription'}
                </p>
                <p className={`text-xs mt-0.5 ${subscriptionActive ? 'text-success-dark/80' : 'text-warning-dark/80'}`}>
                  {subscriptionActive
                    ? `${subscription.planName || subscription.plan} Plan · Expires: ${formatDate(subscription.expiryDate)} · ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining · ${studentCount}/${studentLimit} students enrolled`
                    : 'Activate your subscription to enable full access'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {subscriptionActive && subscription.paymentReference && (
                <span className="text-xs bg-white/60 text-success-dark px-2 py-1 rounded-lg font-mono">
                  Ref: {subscription.paymentReference}
                </span>
              )}
              {!subscriptionActive && (
                <button
                  onClick={() => setActiveSection('subscription')}
                  className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning-dark transition-colors text-sm font-semibold min-h-[40px]"
                >
                  Activate Now
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Student capacity bar (shown when subscription is active) */}
        {subscription && subscriptionActive && studentLimit > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 p-3 rounded-xl border bg-white border-border"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-content-secondary">
                Student Capacity
              </span>
              <span className="text-xs font-bold text-content-primary">
                {studentCount} / {studentLimit}
              </span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((studentCount / studentLimit) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background:
                    studentCount / studentLimit > 0.9
                      ? 'linear-gradient(90deg, #D97706, #DC2626)'
                      : studentCount / studentLimit > 0.7
                      ? 'linear-gradient(90deg, #059669, #D97706)'
                      : 'linear-gradient(90deg, #059669, #10B981)',
                }}
              />
            </div>
            <p className="text-xs text-content-muted mt-1">
              {remainingStudents} slot{remainingStudents !== 1 ? 's' : ''} remaining on your {subscription.planName || subscription.plan} plan
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Stats error notice ───────────────────────────────────────────── */}
      {statsError && (
        <div className="card p-4 flex items-center justify-between gap-3 border-warning/30 bg-warning-light">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-warning-dark">Stats unavailable</p>
              <p className="text-xs text-warning-dark/80">Could not load dashboard data from server.</p>
            </div>
          </div>
          <button
            onClick={() => { setLoading(true); fetchDashboardStats(); }}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-dk transition-all min-h-[40px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── KPI Stat Cards ───────────────────────────────────────────────── */}
      <div className={homeStatsGrid}>
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.06 }}
            className={homeStatCard}
            style={{ background: card.gradient }}
          >
            <div className={homeStatCardTop}>
              <div className={homeStatCardIconWrap}>
                <span className={homeStatCardIcon}>{card.icon}</span>
              </div>
            </div>
            <p className={homeStatCardValue}>{card.value}</p>
            <p className={homeStatCardLabel}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Action Cards ───────────────────────────────────────────── */}
      <div className={homeActionsGrid}>
        {quickActions.map((action, index) => (
          <motion.button
            key={action.title}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 + index * 0.05 }}
            onClick={action.action}
            className={`${homeActionButton} ${ACTION_STYLES[index]} bg-white`}
          >
            <div className={homeActionIcon}>{action.icon}</div>
            <h3 className={homeActionTitle}>{action.title}</h3>
          </motion.button>
        ))}
      </div>

      {/* ── Exam Insights Summary ────────────────────────────────────────── */}
      {recentExams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-5 border border-border rounded-xl bg-white"
        >
          <h2 className={homeCardTitle}>Exam Insights</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-3">
            {[
              { label: 'Completed',       value: examBreakdown.completed,        icon: '✅', color: 'text-success-dark' },
              { label: 'In Progress',      value: examBreakdown.inProgress,       icon: '⏳', color: 'text-blue-600' },
              { label: 'Auto-Submitted',   value: examBreakdown.autoSubmitted,    icon: '🤖', color: 'text-orange-600' },
              { label: 'Highest Score',    value: `${examBreakdown.highestScore}%`, icon: '🏆', color: 'text-success-dark' },
              { label: 'Lowest Score',     value: `${examBreakdown.lowestScore}%`,  icon: '📉', color: 'text-danger-dark' },
              { label: 'Tab Switches',     value: examBreakdown.totalTabSwitches, icon: '🔀', color: 'text-warning-dark' },
              { label: 'Avg Duration',     value: `${examBreakdown.avgDuration}m`, icon: '⏱️', color: 'text-brand-primary' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.04 }}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-surface-muted hover:bg-surface-subtle transition-colors"
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-content-muted mt-0.5">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Subject Performance ──────────────────────────────────────────── */}
      {subjectPerfEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-5 border border-border rounded-xl bg-white"
        >
          <h2 className={homeCardTitle}>Subject Performance</h2>
          <div className="space-y-4 mt-3">
            {subjectPerfEntries.map((subj, i) => {
              const maxScore = 20; // marks per subject based on API data
              const pct = Math.min((subj.average / maxScore) * 100, 100);
              return (
                <motion.div
                  key={subj.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-content-primary">{subj.name}</span>
                      <span className="text-xs text-content-muted bg-surface-muted px-2 py-0.5 rounded-full">
                        {subj.count} exam{subj.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: getProgressBarColor(pct) }}>
                      {subj.average} avg
                    </span>
                  </div>
                  <div className="w-full bg-surface-subtle rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + i * 0.08, ease: 'easeOut' }}
                      className="h-full rounded-full transition-all"
                      style={{ backgroundColor: getProgressBarColor(pct) }}
                    />
                  </div>
                  <p className="text-xs text-content-muted mt-0.5">
                    Total marks scored: {subj.total} across {subj.count} attempt{subj.count !== 1 ? 's' : ''}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Content Grid: Quick Access + Recent Exams ────────────────────── */}
      <div className={homeContentGrid}>
        {/* Quick Access */}
        <div className={homeCard}>
          <h2 className={homeCardTitle}>Quick Access</h2>
          <div className={homeSubjectGrid}>
            {[
              { id: 'students',    icon: '👥', name: 'Student Registration', sub: 'Add & manage students' },
              { id: 'subjects',    icon: '📚', name: 'Subjects',             sub: 'Manage subject list' },
              { id: 'questions',   icon: '❓', name: 'Question Bank',         sub: 'Add exam questions' },
              { id: 'exams',       icon: '📝', name: 'Exam Setup',            sub: 'Create new exams' },
              { id: 'results',     icon: '📊', name: 'Exam Results',          sub: 'View performance' },
              { id: 'performance', icon: '📈', name: 'Analytics',             sub: 'Detailed insights' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={homeSubjectButton}
              >
                <div className={homeSubjectInner}>
                  <span className={homeSubjectIcon}>{item.icon}</span>
                  <div>
                    <div className={homeSubjectName}>{item.name}</div>
                    <div className={homeSubjectCount}>{item.sub}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Exams */}
        <div className={homeCard}>
          <h2 className={homeCardTitle}>
            Recent Exams
            {recentExams.length > 0 && (
              <span className="ml-2 text-xs font-normal text-content-muted bg-surface-muted px-2 py-0.5 rounded-full">
                {recentExams.length} total
              </span>
            )}
          </h2>
          {recentExams.length > 0 ? (
            <div className="space-y-2">
              {recentExams.slice(0, 10).map((exam, index) => {
                const statusBadge = getStatusBadge(exam.status);
                const subjectNames = exam.subjects
                  ? exam.subjects.map((s) => s.subjectName).join(', ')
                  : 'N/A';

                return (
                  <motion.div
                    key={exam.id || index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center justify-between p-3 bg-surface-muted rounded-xl hover:bg-surface-subtle transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-content-primary truncate">
                        {exam.title || 'Untitled Exam'}
                      </p>
                      <p className="text-xs text-content-muted mt-0.5 truncate">
                        {subjectNames} · {exam.questionCount || 0} questions · {formatDate(exam.createdAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.cls}`}>
                          {statusBadge.text}
                        </span>
                        {exam.autoSubmitted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600">
                            Auto-submitted
                          </span>
                        )}
                        {exam.tabSwitches > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600">
                            {exam.tabSwitches} tab switch{exam.tabSwitches !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-3 flex-shrink-0 flex flex-col items-end gap-1">
                      {exam.status === 'completed' ? (
                        <>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getScoreBadgeClass(exam.percentage)}`}>
                            {exam.percentage}%
                          </span>
                          <span className="text-[10px] text-content-muted">
                            {exam.score}/{exam.totalMarks} marks
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-content-muted italic">Pending</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {recentExams.length > 10 && (
                <button
                  onClick={() => setActiveSection('results')}
                  className="w-full mt-2 py-2.5 text-sm font-semibold text-brand-primary bg-brand-primary-lt rounded-xl hover:bg-brand-primary/10 transition-colors"
                >
                  View All {recentExams.length} Exams →
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-5xl mb-3">📋</span>
              <p className="text-sm font-medium text-content-secondary">No recent exams yet</p>
              <p className="text-xs text-content-muted mt-1">Exams will appear here once students start taking them</p>
              <button
                onClick={() => setActiveSection('exams')}
                className="mt-4 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-dk transition-all"
              >
                Create an Exam
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Exam Score Distribution (recent exams) ───────────────────────── */}
      {recentExams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-5 border border-border rounded-xl bg-white"
        >
          <h2 className={homeCardTitle}>Score Distribution (Recent Exams)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {(() => {
              const completedExams = recentExams.filter((e) => e.status === 'completed');
              const ranges = [
                { label: 'Excellent (≥80%)', min: 80, max: 101, color: '#059669', bg: 'bg-success-light' },
                { label: 'Good (60-79%)',     min: 60, max: 80,  color: '#2563EB', bg: 'bg-blue-50' },
                { label: 'Fair (40-59%)',      min: 40, max: 60,  color: '#D97706', bg: 'bg-warning-light' },
                { label: 'Poor (<40%)',        min: 0,  max: 40,  color: '#DC2626', bg: 'bg-danger-light' },
              ];

              return ranges.map((range) => {
                const count = completedExams.filter(
                  (e) => e.percentage >= range.min && e.percentage < range.max
                ).length;
                return (
                  <div
                    key={range.label}
                    className={`${range.bg} rounded-xl p-4 text-center`}
                  >
                    <p className="text-2xl font-bold" style={{ color: range.color }}>
                      {count}
                    </p>
                    <p className="text-xs text-content-secondary mt-1 font-medium">{range.label}</p>
                  </div>
                );
              });
            })()}
          </div>
        </motion.div>
      )}

      {/* ── Support Banner ───────────────────────────────────────────────── */}
      <div
        className={homeBanner}
        style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
      >
        <div className={homeBannerContent}>
          <div>
            <h3 className={homeBannerTitle}>Need Technical Support?</h3>
            <p className={homeBannerText}>
              Our Mega Tech Solutions team is ready to assist you with any questions or issues.
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
              onClick={() => window.open('mailto:support@megatechsolutions.ng')}
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