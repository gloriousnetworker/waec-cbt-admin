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
} from '../styles';

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
  const [stats, setStats] = useState({
    totalExams: 0,
    totalResults: 0,
    averageScore: 0,
    passRate: 0
  });

  const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/admin/exam-setups');
      if (response.ok) {
        const data = await response.json();
        const completedExams = data.exams?.filter(e => e.status === 'completed' || e.status === 'active') || [];
        setExams(completedExams);
        
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
          h1 { color: #10b981; }
          .header { margin-bottom: 30px; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-item { background: #f3f4f6; padding: 15px; border-radius: 8px; flex: 1; }
          .summary-item h3 { margin: 0 0 5px; font-size: 12px; color: #666; }
          .summary-item p { margin: 0; font-size: 24px; font-weight: bold; color: #1e1e1e; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #10b981; color: white; padding: 12px; text-align: left; font-size: 12px; }
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
          h1 { color: #10b981; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-item { background: #f3f4f6; padding: 15px; border-radius: 8px; flex: 1; }
          .summary-item h3 { margin: 0 0 5px; font-size: 12px; color: #666; }
          .summary-item p { margin: 0; font-size: 24px; font-weight: bold; color: #1e1e1e; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #10b981; color: white; padding: 12px; text-align: left; font-size: 12px; }
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
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-[32px] mb-2">📝</div>
          <div className="text-[24px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair mb-1">
            {stats.totalExams}
          </div>
          <div className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
            Total Exams
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-[32px] mb-2">👥</div>
          <div className="text-[24px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair mb-1">
            {stats.totalResults}
          </div>
          <div className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
            Results Submitted
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-[32px] mb-2">📊</div>
          <div className="text-[24px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair mb-1">
            {stats.averageScore}%
          </div>
          <div className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
            Average Score
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-[32px] mb-2">✅</div>
          <div className="text-[24px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair mb-1">
            {stats.passRate}%
          </div>
          <div className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
            Pass Rate
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search exams by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
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
            className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
            onClick={() => fetchExamResults(exam.id)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">
                    {exam.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] ${
                    exam.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {exam.status}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] leading-[100%] font-[500]">
                    {exam.class}
                  </span>
                </div>
                <p className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair mb-1">
                  {exam.subjects?.length || 0} subject(s) • {exam.subjects?.reduce((sum, s) => sum + (s.questionCount || 0), 0)} questions
                </p>
                <p className="text-[13px] leading-[140%] font-[400] text-[#1E1E1E] font-playfair line-clamp-1">
                  {exam.description || 'No description provided'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] leading-[100%] font-[400] text-[#9CA3AF] font-playfair">
                  {exam.subjects?.length || 0} subjects
                </p>
                <p className="text-[11px] leading-[100%] font-[400] text-[#10b981] font-playfair mt-1">
                  Click to view results →
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-[18px] leading-[120%] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Results Found</h3>
          <p className="text-[14px] leading-[140%] font-[400] text-[#626060] font-playfair">
            No exam results match your current filters.
          </p>
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
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="px-3 py-1 bg-green-100 text-green-600 rounded-md text-[11px] font-[600] hover:bg-green-200"
                >
                  CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-[11px] font-[600] hover:bg-red-200"
                >
                  PDF
                </button>
                <button
                  onClick={exportToWord}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-[11px] font-[600] hover:bg-blue-200"
                >
                  Word
                </button>
                <button
                  onClick={() => {
                    setShowResultsModal(false);
                    setExamResults(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-[11px] text-[#626060] mb-1">Total Students</p>
                <p className="text-[20px] font-[700] text-[#1E1E1E]">{examResults.summary.totalStudents}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-[11px] text-[#626060] mb-1">Submitted</p>
                <p className="text-[20px] font-[700] text-[#1E1E1E]">{examResults.summary.submittedCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-[11px] text-[#626060] mb-1">Average Score</p>
                <p className="text-[20px] font-[700] text-[#1E1E1E]">{Math.round(examResults.summary.averageScore)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-[11px] text-[#626060] mb-1">Pass Rate</p>
                <p className="text-[20px] font-[700] text-[#10b981]">{Math.round(examResults.summary.passRate)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-[11px] text-[#626060] mb-1">Distinction</p>
                <p className="text-[20px] font-[700] text-[#8b5cf6]">{Math.round(examResults.summary.distinctionRate || 0)}%</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-[600] text-[#626060]">Student</th>
                    <th className="px-4 py-3 text-left text-[11px] font-[600] text-[#626060]">Class</th>
                    <th className="px-4 py-3 text-left text-[11px] font-[600] text-[#626060]">Score</th>
                    <th className="px-4 py-3 text-left text-[11px] font-[600] text-[#626060]">Percentage</th>
                    <th className="px-4 py-3 text-left text-[11px] font-[600] text-[#626060]">Correct</th>
                    <th className="px-4 py-3 text-left text-[11px] font-[600] text-[#626060]">Wrong</th>
                    <th className="px-4 py-3 text-left text-[11px] font-[600] text-[#626060]">Unanswered</th>
                    <th className="px-4 py-3 text-left text-[11px] font-[600] text-[#626060]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {examResults.results.map((result, index) => {
                    const percentage = result.percentage || 0;
                    const percentageClass = percentage >= 75 ? 'bg-green-100 text-green-600' :
                                          percentage >= 60 ? 'bg-blue-100 text-blue-600' :
                                          percentage >= 50 ? 'bg-yellow-100 text-yellow-600' :
                                          'bg-red-100 text-red-600';
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-[500] text-[#1E1E1E]">{result.studentName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-[#626060]">{result.studentClass}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-[500]">{result.score}/{result.totalMarks}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-[600] ${percentageClass}`}>
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
                          <span className="text-[12px] text-gray-400">{result.totalQuestions - (result.correctAnswers + result.wrongAnswers)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-[#626060]">
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