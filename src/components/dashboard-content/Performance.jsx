// components/dashboard-content/Performance.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  examsContainer,
  examsHeader,
  examsTitle,
  examsSubtitle,
  homeStatsGrid,
  homeStatCard,
  homeStatCardTop,
  homeStatCardIconWrap,
  homeStatCardIcon,
  homeStatCardValue,
  homeStatCardLabel,
  homeContentGrid,
  homeCard,
  homeCardTitle,
} from '../../styles/styles';

// Stat card gradients — matching Home.jsx palette
const PERF_GRADIENTS = [
  'linear-gradient(135deg, #1F2A49 0%, #3A4F7A 100%)',
  'linear-gradient(135deg, #059669 0%, #1F2A49 100%)',
  'linear-gradient(135deg, #1F2A49 0%, #2d3f6b 100%)',
];

// Safe Firestore Timestamp / ISO string → formatted date
const formatDate = (value) => {
  if (!value) return 'N/A';
  try {
    if (typeof value === 'object' && value._seconds) {
      return new Date(value._seconds * 1000).toLocaleDateString();
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

const scoreColor  = (s) => s >= 75 ? 'text-success'      : s >= 50 ? 'text-warning'      : 'text-danger';
const scoreBg     = (s) => s >= 75 ? 'bg-success'         : s >= 50 ? 'bg-warning'         : 'bg-danger';
const scoreBadge  = (s) => s >= 75 ? 'bg-success-light text-success' : s >= 50 ? 'bg-warning-light text-warning-dark' : 'bg-danger-light text-danger';

// ── Safe localStorage read ────────────────────────────────────────────────────
const safeParseLS = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function Performance({ setActiveSection }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentExams,    setStudentExams]    = useState([]);

  useEffect(() => {
    const student = safeParseLS('selected_student');
    const exams   = safeParseLS('student_exams');
    if (student) {
      setSelectedStudent(student);
      setStudentExams(Array.isArray(exams) ? exams : []);
    }
  }, []);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!selectedStudent) {
    return (
      <div className={examsContainer}>
        <div className={examsHeader}>
          <h1 className={examsTitle}>Performance Analytics</h1>
          <p className={examsSubtitle}>Select a student to view their performance</p>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-card p-10 sm:p-14 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-content-primary mb-2">No Student Selected</h3>
          <p className="text-sm text-content-muted mb-6 max-w-xs mx-auto">
            Please select a student from the Students page to view their performance analytics.
          </p>
          <button
            onClick={() => setActiveSection('students')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-colors text-sm font-semibold min-h-[44px]"
          >
            Go to Students →
          </button>
        </div>
      </div>
    );
  }

  // ── Compute stats from exams array (API has no separate performance field) ───
  const completedExams = studentExams.filter(e => e.status === 'completed');

  const totalExams   = completedExams.length;
  const averageScore = totalExams > 0
    ? Math.round(completedExams.reduce((sum, e) => sum + (e.percentage ?? 0), 0) / totalExams)
    : 0;

  // Group by subject name across all completed exams
  const subjectMap = {};
  completedExams.forEach((exam) => {
    (exam.subjects ?? []).forEach((sub) => {
      const name = sub.subjectName || 'Unknown';
      if (!subjectMap[name]) subjectMap[name] = { totalScore: 0, attempts: 0 };
      subjectMap[name].totalScore += exam.percentage ?? 0;
      subjectMap[name].attempts  += 1;
    });
  });
  const subjects = Object.entries(subjectMap).map(([name, d]) => ({
    name,
    avgScore:   Math.round(d.totalScore / d.attempts),
    totalExams: d.attempts,
  }));

  // ── Student identity ─────────────────────────────────────────────────────────
  const fullName    = [selectedStudent.firstName, selectedStudent.lastName].filter(Boolean).join(' ') || 'Student';
  const initials    = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ST';
  const studentClass = selectedStudent.class || selectedStudent.className || '';
  const loginId     = selectedStudent.loginId || '';
  const email       = selectedStudent.email   || '';
  const subMeta     = [studentClass, loginId, email].filter(Boolean).join(' · ');

  const statCards = [
    { icon: '📚', value: totalExams,         label: 'Total Exams',   gradient: PERF_GRADIENTS[0] },
    { icon: '📈', value: `${averageScore}%`, label: 'Average Score', gradient: PERF_GRADIENTS[1] },
    { icon: '📖', value: subjects.length,    label: 'Subjects',      gradient: PERF_GRADIENTS[2] },
  ];

  return (
    <div className={examsContainer}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className={examsHeader}>
        <button
          onClick={() => setActiveSection('students')}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline mb-3"
        >
          ← Back to Students
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
          >
            {initials}
          </div>
          <div>
            <h1 className={examsTitle}>{fullName}</h1>
            {subMeta && <p className="text-sm text-content-muted mt-0.5">{subMeta}</p>}
          </div>
        </div>
      </div>

      {/* ── KPI stat cards ──────────────────────────────────────────────────── */}
      <div className={homeStatsGrid}>
        {statCards.map(({ icon, value, label, gradient }, i) => (
          <motion.div
            key={label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className={homeStatCard}
            style={{ background: gradient }}
          >
            <div className={homeStatCardTop}>
              <div className={homeStatCardIconWrap}>
                <span className={homeStatCardIcon}>{icon}</span>
              </div>
            </div>
            <p className={homeStatCardValue}>{value}</p>
            <p className={homeStatCardLabel}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Content grid ────────────────────────────────────────────────────── */}
      <div className={homeContentGrid}>

        {/* Subject Performance */}
        <div className={homeCard}>
          <h2 className={homeCardTitle}>Subject Performance</h2>
          {subjects.length > 0 ? (
            <div className="space-y-4 mt-4">
              {subjects.map((subject) => (
                <div key={subject.name} className="p-4 bg-surface-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-content-primary">{subject.name}</span>
                    <span className={`text-sm font-bold ${scoreColor(subject.avgScore)}`}>
                      {subject.avgScore}%
                    </span>
                  </div>
                  <p className="text-xs text-content-muted mb-2">
                    {subject.totalExams} exam{subject.totalExams !== 1 ? 's' : ''}
                  </p>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${scoreBg(subject.avgScore)}`}
                      style={{ width: `${subject.avgScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm text-content-muted">No completed exams yet</p>
            </div>
          )}
        </div>

        {/* Recent Exams */}
        <div className={homeCard}>
          <h2 className={homeCardTitle}>Recent Exams</h2>
          {completedExams.length > 0 ? (
            <div className="divide-y divide-border mt-4">
              {completedExams.slice(0, 5).map((exam, idx) => {
                const subjectNames = (exam.subjects ?? []).map(s => s.subjectName).filter(Boolean).join(', ') || 'General';
                const pct = exam.percentage ?? 0;
                return (
                  <div key={exam.id ?? idx} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-content-primary leading-snug truncate">
                          {exam.title || 'Untitled Exam'}
                        </p>
                        <p className="text-xs text-content-muted mt-0.5">{subjectNames}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${scoreBadge(pct)}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-content-muted mt-1">
                      <span>{exam.questionCount ?? 0} questions · {exam.score ?? 0}/{exam.totalMarks ?? 0} marks</span>
                      <span>{formatDate(exam.endTime)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-sm text-content-muted">No completed exams yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
