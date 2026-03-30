// components/dashboard-content/Feedback.jsx — FEAT-2: Admin view of student feedback
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  examsContainer, examsHeader, examsTitle, examsSubtitle,
  superAdminStatCard, superAdminStatValue, superAdminStatLabel,
} from '../../styles/styles';

const STARS = [1, 2, 3, 4, 5];
const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
const RATING_COLORS = { 1: 'text-red-500', 2: 'text-orange-400', 3: 'text-yellow-500', 4: 'text-blue-500', 5: 'text-green-600' };

function StarDisplay({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {STARS.map(s => (
        <span key={s} className={`text-sm ${s <= rating ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
      ))}
    </span>
  );
}

export default function Feedback() {
  const { fetchWithAuth } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({ total: 0, unreadCount: 0, avgRating: 0, ratingBreakdown: {} });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchFeedback(); }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/admin/feedback');
      if (res?.ok) {
        const data = await res.json();
        setFeedback(data.feedback || []);
        setStats({
          total: data.total || 0,
          unreadCount: data.unreadCount || 0,
          avgRating: data.avgRating || 0,
          ratingBreakdown: data.ratingBreakdown || {},
        });
      }
    } catch (e) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await fetchWithAuth(`/admin/feedback/${id}/read`, { method: 'PATCH' });
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, read: true } : f));
      setStats(prev => ({ ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }));
    } catch (_) {}
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = feedback.filter(f => {
    const matchRating = filterRating === 'all' || f.rating === parseInt(filterRating);
    const matchSearch = !search ||
      (f.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.comment || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.subjectName || '').toLowerCase().includes(search.toLowerCase());
    return matchRating && matchSearch;
  });

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <div>
          <h1 className={examsTitle}>Student Feedback</h1>
          <p className={examsSubtitle}>Post-exam ratings and comments from your students</p>
        </div>
        {stats.unreadCount > 0 && (
          <span className="px-3 py-1.5 bg-brand-primary text-white rounded-full text-xs font-bold">
            {stats.unreadCount} unread
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className={superAdminStatCard}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[28px]">📝</span>
            <span className={superAdminStatValue}>{stats.total}</span>
          </div>
          <p className={superAdminStatLabel}>Total Responses</p>
        </div>
        <div className={superAdminStatCard}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[28px]">⭐</span>
            <span className={superAdminStatValue}>{stats.avgRating || '—'}</span>
          </div>
          <p className={superAdminStatLabel}>Avg Rating / 5</p>
        </div>
        {[5, 4].map(r => (
          <div key={r} className={superAdminStatCard}>
            <div className="flex items-center justify-between mb-2">
              <StarDisplay rating={r} />
              <span className={superAdminStatValue}>{stats.ratingBreakdown[r] || 0}</span>
            </div>
            <p className={superAdminStatLabel}>{RATING_LABELS[r]}</p>
          </div>
        ))}
      </div>

      {/* Rating bar chart */}
      {stats.total > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-bold text-content-primary mb-4">Rating Breakdown</h3>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map(r => {
              const count = stats.ratingBreakdown[r] || 0;
              const pct = stats.total ? (count / stats.total) * 100 : 0;
              return (
                <div key={r} className="flex items-center gap-3">
                  <span className="text-xs w-16 text-content-secondary">{RATING_LABELS[r]}</span>
                  <div className="flex-1 h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-content-muted w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by student, subject, or comment..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-brand-primary text-[13px]"
        />
        <select
          value={filterRating}
          onChange={e => setFilterRating(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-brand-primary text-[13px]"
        >
          <option value="all">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{RATING_LABELS[r]} ({r}★)</option>)}
        </select>
        <button onClick={fetchFeedback} className="px-5 py-2.5 bg-brand-primary text-white rounded-lg text-[13px] font-semibold hover:bg-brand-primary-dk">
          Refresh
        </button>
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-[14px] text-content-secondary">Loading feedback...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-[14px] text-content-muted">No feedback found</p>
          {stats.total === 0 && <p className="text-[12px] text-content-muted mt-1">Students will see a feedback prompt after completing an exam.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card p-5 border-l-4 ${f.read ? 'border-l-border' : 'border-l-brand-primary bg-brand-primary-lt/30'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className="text-[14px] font-bold text-content-primary">{f.studentName || 'Student'}</span>
                    {f.studentClass && <span className="text-[11px] px-2 py-0.5 bg-surface-muted rounded-full text-content-secondary">{f.studentClass}</span>}
                    {f.subjectName && (
                      <span className="text-[11px] px-2 py-0.5 bg-brand-primary-lt text-brand-primary rounded-full font-medium flex items-center gap-1">
                        <span className="opacity-60">Exam:</span> {f.subjectName}
                      </span>
                    )}
                    {!f.read && <span className="text-[10px] px-2 py-0.5 bg-brand-primary text-white rounded-full font-bold">NEW</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <StarDisplay rating={f.rating} />
                    <span className={`text-[12px] font-semibold ${RATING_COLORS[f.rating]}`}>{RATING_LABELS[f.rating]}</span>
                  </div>
                  {f.comment && (
                    <p className="text-[13px] text-content-secondary leading-relaxed">{f.comment}</p>
                  )}
                  <p className="text-[11px] text-content-muted mt-2">{formatDate(f.createdAt)}</p>
                </div>
                {!f.read && (
                  <button
                    onClick={() => handleMarkRead(f.id)}
                    className="flex-shrink-0 px-3 py-1.5 text-[11px] border border-border rounded-lg hover:bg-surface-subtle text-content-secondary"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
