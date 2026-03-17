// components/dashboard-content/Subjects.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  examsContainer,
  examsHeader,
  examsTitle,
  examsSubtitle,
} from '../../styles/styles';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' } }),
};

export default function Subjects({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamType, setFilterExamType] = useState('all');

  const examTypes = ['WAEC', 'NECO', 'JAMB', 'GCE', 'Internal'];

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/admin/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      } else {
        toast.error('Failed to load subjects');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestions = (subject) => {
    localStorage.setItem('selected_subject', JSON.stringify(subject));
    setActiveSection('questions');
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExamType = filterExamType === 'all' || subject.examType === filterExamType;
    return matchesSearch && matchesExamType;
  });

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Subject Management</h1>
        <p className={examsSubtitle}>View subjects available for your school</p>
      </div>

      {/* ── Filters ── */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search subjects by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm text-content-primary placeholder-content-muted bg-white transition-all min-h-[44px]"
          />
        </div>
        <select
          value={filterExamType}
          onChange={(e) => setFilterExamType(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm text-content-primary bg-white min-h-[44px]"
        >
          <option value="all">All Exam Types</option>
          {examTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="bg-white rounded-xl border border-border shadow-card p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-content-muted">Loading subjects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject, i) => (
            <motion.div
              key={subject.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className="bg-white rounded-xl border border-border shadow-card p-6 hover:shadow-card-md hover:border-brand-primary transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-content-primary truncate">{subject.name}</h3>
                  <p className="text-xs text-content-muted mt-0.5">Code: {subject.code}</p>
                </div>
              </div>

              <p className="text-sm text-content-muted mb-4 line-clamp-2">
                {subject.description || 'No description provided'}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="px-2 py-1 bg-brand-primary-lt text-brand-primary rounded-full text-[10px] font-medium">
                  {subject.examType}
                </span>
                <span className="px-2 py-1 bg-surface-subtle text-content-secondary rounded-full text-[10px] font-medium">
                  {subject.duration} mins
                </span>
                <span className="px-2 py-1 bg-surface-subtle text-content-secondary rounded-full text-[10px] font-medium">
                  {subject.questionCount || 0} questions
                </span>
                {subject.isGlobal && (
                  <span className="px-2 py-1 bg-info-light text-info rounded-full text-[10px] font-medium">
                    Global
                  </span>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  onClick={() => handleViewQuestions(subject)}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-colors text-sm font-semibold min-h-[36px]"
                >
                  Manage Questions
                </button>
              </div>
            </motion.div>
          ))}

          {filteredSubjects.length === 0 && (
            <div className="col-span-full text-center py-14">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-sm text-content-muted">No subjects found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
