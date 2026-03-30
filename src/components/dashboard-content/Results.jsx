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
  const [stats, setStats] = useState({
    totalExams: 0,
    totalResults: 0,
    averageScore: 0,
    passRate: 0
  });
  const [expandedRow, setExpandedRow] = useState(null);

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

  const exportToCSV = () => {
    if (!examResults) return;
    
    const headers = ['Student Name', 'Class', 'Score', 'Total Marks', 'Percentage', 'Correct Answers', 'Wrong Answers', 'Submitted Date'];
    const rows = examResults.results.map(r => [
      r.studentName,
      r.studentClass,
      r.score,
      r.totalMarks,
      `${r.percentage}%`,
      r.correctAnswers || 0,
      r.wrongAnswers || 0,
      r.submittedAt ? new Date(r.submittedAt._seconds * 1000).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examResults.exam.title}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!examResults) return;
    
    const printWindow = window.open('', '_blank');
    const title = examResults.exam.title;
    const date = new Date().toLocaleDateString();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1F2A49; }
          .header { margin-bottom: 30px; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-item { background: #f3f4f6; padding: 15px; border-radius: 8px; flex: 1; }
          .summary-item h3 { margin: 0 0 5px; font-size: 12px; color: #666; }
          .summary-item p { margin: 0; font-size: 24px; font-weight: bold; color: #1e1e1e; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1F2A49; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 12px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .percentage { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .high { background: #d1fae5; color: #059669; }
          .medium { background: #fef3c7; color: #d97706; }
          .low { background: #fee2e2; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated: ${date}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <h3>Total Students</h3>
            <p>${examResults.summary.totalStudents}</p>
          </div>
          <div class="summary-item">
            <h3>Submitted</h3>
            <p>${examResults.summary.submittedCount}</p>
          </div>
          <div class="summary-item">
            <h3>Average Score</h3>
            <p>${Math.round(examResults.summary.averageScore)}%</p>
          </div>
          <div class="summary-item">
            <h3>Pass Rate</h3>
            <p>${Math.round(examResults.summary.passRate)}%</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    examResults.results.forEach(r => {
      const percentageClass = r.percentage >= 75 ? 'high' : r.percentage >= 50 ? 'medium' : 'low';
      html += `
        <tr>
          <td>${r.studentName}</td>
          <td>${r.studentClass}</td>
          <td>${r.score}/${r.totalMarks}</td>
          <td><span class="percentage ${percentageClass}">${Math.round(r.percentage)}%</span></td>
          <td>${r.correctAnswers || 0}</td>
          <td>${r.wrongAnswers || 0}</td>
          <td>${r.submittedAt ? new Date(r.submittedAt._seconds * 1000).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToWord = () => {
    if (!examResults) return;
    
    const title = examResults.exam.title;
    const date = new Date().toLocaleDateString();
    
    let html = `
      <html>
      <head>
        <title>${title} - Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1F2A49; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-item { background: #f3f4f6; padding: 15px; border-radius: 8px; flex: 1; }
          .summary-item h3 { margin: 0 0 5px; font-size: 12px; color: #666; }
          .summary-item p { margin: 0; font-size: 24px; font-weight: bold; color: #1e1e1e; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1F2A49; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated: ${date}</p>
        <div class="summary">
          <div class="summary-item"><h3>Total Students</h3><p>${examResults.summary.totalStudents}</p></div>
          <div class="summary-item"><h3>Submitted</h3><p>${examResults.summary.submittedCount}</p></div>
          <div class="summary-item"><h3>Average Score</h3><p>${Math.round(examResults.summary.averageScore)}%</p></div>
          <div class="summary-item"><h3>Pass Rate</h3><p>${Math.round(examResults.summary.passRate)}%</p></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    examResults.results.forEach(r => {
      html += `
        <tr>
          <td>${r.studentName}</td>
          <td>${r.studentClass}</td>
          <td>${r.score}/${r.totalMarks}</td>
          <td>${Math.round(r.percentage)}%</td>
          <td>${r.correctAnswers || 0}</td>
          <td>${r.wrongAnswers || 0}</td>
          <td>${r.submittedAt ? new Date(r.submittedAt._seconds * 1000).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'application/msword' });
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
            onClick={() => fetchExamResults(exam.id)}
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
                <button onClick={exportToCSV} className="px-3 py-1.5 bg-success-light text-success-dark rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity min-h-[36px]">CSV</button>
                <button onClick={exportToPDF} className="px-3 py-1.5 bg-danger-light text-danger-dark rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity min-h-[36px]">PDF</button>
                <button onClick={exportToWord} className="px-3 py-1.5 bg-info-light text-info-dark rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity min-h-[36px]">Word</button>
                <button
                  onClick={() => { setShowResultsModal(false); setExamResults(null); }}
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
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Student</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Class</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Score</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Percentage</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Correct</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Wrong</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Unanswered</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Date</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-content-muted">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {examResults.results.map((result, index) => {
                    const percentage = result.percentage || 0;
                    const percentageClass = percentage >= 75 ? 'bg-green-100 text-green-600' :
                                          percentage >= 60 ? 'bg-blue-100 text-blue-600' :
                                          percentage >= 50 ? 'bg-yellow-100 text-yellow-600' :
                                          'bg-red-100 text-red-600';
                    const isExpanded = expandedRow === index;
                    const hasSubjects = result.subjectBreakdown && result.subjectBreakdown.length > 0;

                    return (
                      <>
                        <tr key={index} className="border-b border-border hover:bg-surface-muted">
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium text-content-primary">{result.studentName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-content-muted">{result.studentClass}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium">{result.score}/{result.totalMarks}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${percentageClass}`}>
                              {Math.round(percentage)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] text-green-600">{result.correctAnswers || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] text-red-600">{result.wrongAnswers || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-content-muted">{result.totalQuestions - ((result.correctAnswers || 0) + (result.wrongAnswers || 0))}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-content-muted">
                              {result.submittedAt ? formatDate(result.submittedAt) : 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {hasSubjects ? (
                              <button
                                onClick={() => setExpandedRow(isExpanded ? null : index)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:text-brand-primary-dk transition-colors"
                              >
                                {isExpanded ? 'Hide' : 'Breakdown'}
                                <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-content-muted">—</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && hasSubjects && (
                          <tr key={`${index}-breakdown`} className="bg-brand-primary-lt/20 border-b border-border">
                            <td colSpan={9} className="px-4 py-4">
                              <p className="text-[11px] font-semibold text-content-muted mb-3 uppercase tracking-wide">Subject Breakdown</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {result.subjectBreakdown.map((sb, si) => {
                                  const sbPct = sb.percentage || 0;
                                  const sbColor = sbPct >= 75 ? 'text-green-600 bg-green-50 border-green-200'
                                    : sbPct >= 50 ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                                    : 'text-red-600 bg-red-50 border-red-200';
                                  return (
                                    <div key={si} className={`rounded-lg border p-3 ${sbColor}`}>
                                      <p className="text-[12px] font-bold mb-2 truncate">{sb.subjectName}</p>
                                      <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-[20px] font-extrabold leading-none">{sbPct}%</span>
                                        <span className="text-[10px] opacity-70">{sb.score}/{sb.totalMarks} marks</span>
                                      </div>
                                      <div className="flex gap-3 text-[11px] mt-1.5">
                                        <span className="text-green-700">✓ {sb.correct} correct</span>
                                        <span className="text-red-600">✗ {sb.wrong} wrong</span>
                                        {sb.unanswered > 0 && <span className="opacity-60">— {sb.unanswered} skipped</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
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
                }}
                className={modalButtonSecondary}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}