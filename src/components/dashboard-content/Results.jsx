// components/dashboard-content/Results.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  examsContainer,
  examsHeader,
  examsTitle,
  examsSubtitle,
  modalOverlay,
  modalContainer,
  modalTitle,
  modalActions,
  modalButtonSecondary
} from '../../styles/styles';

export default function Results({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examResults, setExamResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 50;
  const [selectedExamIds, setSelectedExamIds] = useState(new Set());
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extraMinutes, setExtraMinutes] = useState(30);
  const [extending, setExtending] = useState(false);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalResults: 0,
    averageScore: 0,
    passRate: 0
  });
  const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

  useEffect(() => {
    fetchExams();
  }, [page]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`/admin/exam-setups?limit=${LIMIT}&page=${page}`);
      if (response.ok) {
        const data = await response.json();
        const completedExams = data.exams?.filter(e => e.status === 'completed' || e.status === 'active') || [];
        setExams(completedExams);
        setTotalCount(data.total || (data.exams || []).length);
        
        let totalResults = 0;
        let totalPercentage = 0;
        let totalPassed = 0;
        
        for (const exam of completedExams) {
          try {
            const resultsRes = await fetchWithAuth(`/admin/exam-setups/${exam.id}/results`);
            if (resultsRes.ok) {
              const resultsData = await resultsRes.json();
              totalResults += resultsData.summary?.submittedCount || 0;
              totalPercentage += resultsData.summary?.averageScore || 0;
              totalPassed += (resultsData.summary?.passRate || 0) * (resultsData.summary?.submittedCount || 0) / 100;
            }
          } catch (error) {
            console.error('Error fetching results for exam:', exam.id);
          }
        }
        
        setStats({
          totalExams: completedExams.length,
          totalResults,
          averageScore: totalResults > 0 ? Math.round(totalPercentage / completedExams.length) : 0,
          passRate: totalResults > 0 ? Math.round((totalPassed / totalResults) * 100) : 0
        });
      }
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async (examId) => {
    setSelectedExamIds(new Set());
    try {
      const response = await fetchWithAuth(`/admin/exam-setups/${examId}/results`);
      if (response.ok) {
        const data = await response.json();
        setExamResults(data);
        setShowResultsModal(true);
      } else {
        toast.error('Failed to load exam results');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const toggleSelect = (examId) => {
    if (!examId) return;
    setSelectedExamIds(prev => {
      const next = new Set(prev);
      if (next.has(examId)) next.delete(examId);
      else next.add(examId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!examResults) return;
    const allIds = examResults.results.map(r => r.examId).filter(Boolean);
    if (selectedExamIds.size === allIds.length) {
      setSelectedExamIds(new Set());
    } else {
      setSelectedExamIds(new Set(allIds));
    }
  };

  const handleExtend = async () => {
    if (!selectedExamIds.size || !selectedExam) return;
    setExtending(true);
    let successCount = 0;
    for (const examId of selectedExamIds) {
      try {
        const res = await fetchWithAuth(`/admin/exams/${examId}/extend`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extraMinutes }),
        });
        if (res.ok) successCount++;
      } catch (_) {}
    }
    setExtending(false);
    setShowExtendModal(false);
    setSelectedExamIds(new Set());
    if (successCount > 0) {
      toast.success(`Extended ${successCount} exam(s) by ${extraMinutes} minutes`);
      fetchExamResults(selectedExam.id);
    } else {
      toast.error('Failed to extend — check that the exam IDs are valid');
    }
  };

  // Derive subject columns — prefer exam.subjects (always present) over aggregating
  // from result.subjectBreakdown (only present on results submitted after the feature landed)
  const subjectCols = examResults
    ? (examResults.exam.subjects?.length > 0
        ? examResults.exam.subjects
            .filter(s => s.subjectId && s.subjectName)
            .map(s => ({ subjectId: s.subjectId, subjectName: s.subjectName }))
        : [...new Map(
            examResults.results.flatMap(r =>
              (r.subjectBreakdown || []).map(sb => [sb.subjectId, sb.subjectName])
            )
          ).entries()].map(([subjectId, subjectName]) => ({ subjectId, subjectName }))
      )
    : [];

  const getSubjectData = (result, subjectId) =>
    (result.subjectBreakdown || []).find(sb => sb.subjectId === subjectId);

  const exportToCSV = () => {
    if (!examResults) return;

    const subjectHeaders = subjectCols.flatMap(s => [
      `${s.subjectName} Score`, `${s.subjectName} %`, `${s.subjectName} Correct`, `${s.subjectName} Wrong`
    ]);
    const headers = ['Student Name', 'Class', ...subjectHeaders, 'Total Score', 'Total Marks', 'Total %', 'Correct', 'Wrong', 'Date'];

    const rows = examResults.results.map(r => {
      const subjectCells = subjectCols.flatMap(s => {
        const sd = getSubjectData(r, s.subjectId);
        return sd ? [`${sd.score}/${sd.totalMarks}`, `${sd.percentage}%`, sd.correct, sd.wrong] : ['—', '—', '—', '—'];
      });
      return [
        r.studentName, r.studentClass,
        ...subjectCells,
        r.score, r.totalMarks, `${r.percentage}%`,
        r.correctAnswers || 0, r.wrongAnswers || 0,
        r.submittedAt ? formatDate(r.submittedAt) : 'N/A',
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examResults.exam.title}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const buildExportHTML = (forPrint) => {
    const title = examResults.exam.title;
    const date = new Date().toLocaleDateString();
    const subjectThs = subjectCols.map(s => `<th>${s.subjectName}</th>`).join('');
    const rows = examResults.results.map(r => {
      const pctClass = r.percentage >= 75 ? 'high' : r.percentage >= 50 ? 'medium' : 'low';
      const subjectTds = subjectCols.map(s => {
        const sd = getSubjectData(r, s.subjectId);
        if (!sd) return '<td>—</td>';
        const c = sd.percentage >= 75 ? 'high' : sd.percentage >= 50 ? 'medium' : 'low';
        return `<td><span class="percentage ${c}">${sd.percentage}%</span><br/><small>${sd.score}/${sd.totalMarks} &nbsp;✓${sd.correct} ✗${sd.wrong}</small></td>`;
      }).join('');
      return `<tr>
        <td>${r.studentName}</td>
        <td>${r.studentClass}</td>
        ${subjectTds}
        <td><span class="percentage ${pctClass}">${Math.round(r.percentage)}%</span><br/><small>${r.score}/${r.totalMarks}</small></td>
        <td>${r.correctAnswers || 0}</td><td>${r.wrongAnswers || 0}</td>
        <td>${r.submittedAt ? formatDate(r.submittedAt) : 'N/A'}</td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html><head><title>${title} - Results</title>
      <style>
        body{font-family:Arial,sans-serif;margin:40px}
        h1{color:#1F2A49}
        .summary{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap}
        .summary-item{background:#f3f4f6;padding:12px 16px;border-radius:8px;min-width:100px}
        .summary-item h3{margin:0 0 4px;font-size:11px;color:#666}
        .summary-item p{margin:0;font-size:20px;font-weight:bold;color:#1e1e1e}
        table{width:100%;border-collapse:collapse;margin-top:16px;font-size:11px}
        th{background:#1F2A49;color:#fff;padding:10px 8px;text-align:left}
        td{padding:8px;border-bottom:1px solid #ddd;vertical-align:top}
        tr:nth-child(even){background:#f9f9f9}
        small{color:#888;font-size:10px}
        .percentage{padding:2px 6px;border-radius:4px;font-weight:bold;font-size:11px}
        .high{background:#d1fae5;color:#059669}
        .medium{background:#fef3c7;color:#d97706}
        .low{background:#fee2e2;color:#dc2626}
      </style></head><body>
      <h1>${title}</h1><p>Generated: ${date}</p>
      <div class="summary">
        <div class="summary-item"><h3>Total Students</h3><p>${examResults.summary.totalStudents}</p></div>
        <div class="summary-item"><h3>Submitted</h3><p>${examResults.summary.submittedCount}</p></div>
        <div class="summary-item"><h3>Average Score</h3><p>${Math.round(examResults.summary.averageScore)}%</p></div>
        <div class="summary-item"><h3>Pass Rate</h3><p>${Math.round(examResults.summary.passRate)}%</p></div>
      </div>
      <table><thead><tr>
        <th>Student</th><th>Class</th>${subjectThs}
        <th>Total</th><th>Correct</th><th>Wrong</th><th>Date</th>
      </tr></thead><tbody>${rows}</tbody></table>
      ${forPrint ? '<script>window.onload=()=>window.print()</script>' : ''}
    </body></html>`;
  };

  const exportToPDF = () => {
    if (!examResults) return;
    const w = window.open('', '_blank');
    w.document.write(buildExportHTML(true));
    w.document.close();
  };

  const exportToWord = () => {
    if (!examResults) return;
    const blob = new Blob([buildExportHTML(false)], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examResults.exam.title}_results.doc`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || exam.class === filterClass;
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Exam Results</h1>
        <p className={examsSubtitle}>View and analyze student performance across all exams</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { icon: '📝', value: stats.totalExams, label: 'Total Exams' },
          { icon: '👥', value: stats.totalResults, label: 'Results Submitted' },
          { icon: '📊', value: `${stats.averageScore}%`, label: 'Average Score' },
          { icon: '✅', value: `${stats.passRate}%`, label: 'Pass Rate' },
        ].map(({ icon, value, label }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 sm:p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xl sm:text-2xl font-bold text-content-primary mb-1">{value}</div>
            <div className="text-xs text-content-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search exams by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm text-content-primary placeholder-content-muted min-h-[44px]"
          />
          <div className="flex gap-2 flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm text-content-primary min-h-[44px]"
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (<option key={cls} value={cls}>{cls}</option>))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm text-content-primary min-h-[44px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredExams.map((exam) => (
          <motion.div
            key={exam.id}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl border border-border p-4 sm:p-6 cursor-pointer hover:shadow-card-md hover:border-brand-primary transition-all"
            onClick={() => { setSelectedExam(exam); fetchExamResults(exam.id); }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-base font-bold text-content-primary truncate">
                    {exam.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                    exam.status === 'active' ? 'bg-success-light text-success-dark' : 'bg-info-light text-info-dark'
                  }`}>{exam.status}</span>
                  <span className="px-2 py-0.5 bg-brand-primary-lt text-brand-primary rounded-full text-xs font-semibold flex-shrink-0">
                    {exam.class}
                  </span>
                </div>
                <p className="text-xs text-content-muted mb-1">
                  {exam.subjects?.length || 0} subject(s) · {exam.subjects?.reduce((sum, s) => sum + (s.questionCount || 0), 0)} questions
                </p>
                <p className="text-sm text-content-secondary line-clamp-1">
                  {exam.description || 'No description provided'}
                </p>
              </div>
              <div className="flex-shrink-0 text-sm font-semibold text-brand-primary">
                View results →
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-content-primary mb-2">No Results Found</h3>
          <p className="text-sm text-content-muted">No exam results match your current filters.</p>
        </div>
      )}

      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-border gap-3">
          <p className="text-sm text-content-muted">
            Page {page} of {Math.ceil(totalCount / LIMIT)} · {totalCount} total results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >Previous</button>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(totalCount / LIMIT), p + 1))}
              disabled={page >= Math.ceil(totalCount / LIMIT)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >Next</button>
          </div>
        </div>
      )}

      {showResultsModal && examResults && (
        <div className={modalOverlay} onClick={() => {
          setShowResultsModal(false);
          setExamResults(null);
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className={modalTitle}>{examResults.exam.title}</h3>
                <p className="text-[13px] text-[#626060] mt-1">Total Marks: {examResults.exam.totalMarks} • Pass Mark: {examResults.exam.passMark}%</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedExamIds.size > 0 && (
                  <button
                    onClick={() => setShowExtendModal(true)}
                    className="px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity min-h-[36px]"
                  >
                    Extend/Reopen ({selectedExamIds.size})
                  </button>
                )}
                <button onClick={exportToCSV} className="px-3 py-1.5 bg-success-light text-success-dark rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity min-h-[36px]">CSV</button>
                <button onClick={exportToPDF} className="px-3 py-1.5 bg-danger-light text-danger-dark rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity min-h-[36px]">PDF</button>
                <button onClick={exportToWord} className="px-3 py-1.5 bg-info-light text-info-dark rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity min-h-[36px]">Word</button>
                <button
                  onClick={() => { setShowResultsModal(false); setExamResults(null); setSelectedExamIds(new Set()); }}
                  className="p-1.5 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-lg transition-colors ml-1 min-h-[36px] min-w-[36px] flex items-center justify-center text-lg"
                  aria-label="Close"
                >×</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {[
                { label: 'Total Students', value: examResults.summary.totalStudents, color: 'text-content-primary' },
                { label: 'Submitted', value: examResults.summary.submittedCount, color: 'text-content-primary' },
                { label: 'Average Score', value: `${Math.round(examResults.summary.averageScore)}%`, color: 'text-content-primary' },
                { label: 'Pass Rate', value: `${Math.round(examResults.summary.passRate)}%`, color: 'text-success-dark' },
                { label: 'Distinction', value: `${Math.round(examResults.summary.distinctionRate || 0)}%`, color: 'text-brand-primary' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-surface-muted p-3 rounded-lg">
                  <p className="text-xs text-content-muted mb-1">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted border-b border-border">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={examResults.results.filter(r => r.examId).length > 0 && selectedExamIds.size === examResults.results.filter(r => r.examId).length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-border cursor-pointer accent-brand-primary"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted whitespace-nowrap">Student</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted whitespace-nowrap">Class</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted whitespace-nowrap">Status</th>
                    {subjectCols.map(s => (
                      <th key={s.subjectId} className="px-4 py-3 text-left text-[11px] font-semibold text-brand-primary whitespace-nowrap">
                        {s.subjectName}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted whitespace-nowrap">Total</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted whitespace-nowrap">Correct</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted whitespace-nowrap">Wrong</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted whitespace-nowrap">Unanswered</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {examResults.results.map((result, index) => {
                    const percentage = result.percentage || 0;
                    const totalPctClass = percentage >= 75 ? 'bg-green-100 text-green-700'
                      : percentage >= 50 ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-600';
                    const isSelected = result.examId && selectedExamIds.has(result.examId);
                    const statusLabel = result.status === 'in_progress' ? 'In Progress'
                      : result.status === 'auto_submitted' ? 'Auto-Submit'
                      : 'Submitted';
                    const statusClass = result.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700'
                      : result.status === 'auto_submitted' ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-700';

                    return (
                      <tr key={index} className={`border-b border-border hover:bg-surface-muted ${isSelected ? 'bg-brand-primary-lt' : ''}`}>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!result.examId}
                            onChange={() => toggleSelect(result.examId)}
                            className="w-4 h-4 rounded border-border cursor-pointer accent-brand-primary disabled:opacity-30"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium text-content-primary">{result.studentName}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-content-muted">{result.studentClass}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClass}`}>{statusLabel}</span>
                        </td>
                        {subjectCols.map(s => {
                          const sd = getSubjectData(result, s.subjectId);
                          if (!sd) return (
                            <td key={s.subjectId} className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs text-content-muted">—</span>
                            </td>
                          );
                          const spct = sd.percentage || 0;
                          const spctClass = spct >= 75 ? 'bg-green-100 text-green-700'
                            : spct >= 50 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-600';
                          return (
                            <td key={s.subjectId} className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${spctClass}`}>
                                {spct}%
                              </span>
                              <div className="text-[10px] text-content-muted mt-0.5 whitespace-nowrap">
                                {sd.score}/{sd.totalMarks} &nbsp;
                                <span className="text-green-600">✓{sd.correct}</span>&nbsp;
                                <span className="text-red-500">✗{sd.wrong}</span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${totalPctClass}`}>
                            {Math.round(percentage)}%
                          </span>
                          <div className="text-[10px] text-content-muted mt-0.5">{result.score}/{result.totalMarks}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[12px] text-green-600">{result.correctAnswers || 0}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[12px] text-red-600">{result.wrongAnswers || 0}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-content-muted">
                            {result.totalQuestions - ((result.correctAnswers || 0) + (result.wrongAnswers || 0))}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-content-muted">
                            {result.submittedAt ? formatDate(result.submittedAt) : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={modalActions}>
              <button
                onClick={() => {
                  setShowResultsModal(false);
                  setExamResults(null);
                  setSelectedExamIds(new Set());
                }}
                className={modalButtonSecondary}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showExtendModal && (
        <div className={modalOverlay} onClick={() => setShowExtendModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-content-primary mb-1">Extend / Reopen Exam</h3>
            <p className="text-xs text-content-muted mb-4">
              Add extra time to {selectedExamIds.size} selected exam{selectedExamIds.size > 1 ? 's' : ''}. Existing answers are preserved and the student can continue from where they left off.
            </p>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Extra time (minutes)</label>
            <input
              type="number"
              min={1}
              max={180}
              value={extraMinutes}
              onChange={(e) => setExtraMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm text-content-primary mb-4 min-h-[44px]"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowExtendModal(false)}
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-subtle transition-colors min-h-[40px]"
                disabled={extending}
              >
                Cancel
              </button>
              <button
                onClick={handleExtend}
                disabled={extending}
                className="px-4 py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 min-h-[40px]"
              >
                {extending ? 'Extending...' : `Extend +${extraMinutes} min`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}