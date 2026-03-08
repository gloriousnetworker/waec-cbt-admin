// components/dashboard-content/Results.jsx
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
  modalOverlay,
  modalContainer,
  modalTitle,
  modalActions,
  modalButtonSecondary
} from '../styles';

export default function Results({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentExams, setStudentExams] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    passRate: 0,
    distinctionRate: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentsRes = await fetchWithAuth('/admin/students');
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);
        
        // Fetch exams for each student
        const allExams = [];
        for (const student of studentsData.students || []) {
          try {
            const studentDetailsRes = await fetchWithAuth(`/admin/students/${student.id}`);
            if (studentDetailsRes.ok) {
              const studentDetails = await studentDetailsRes.json();
              if (studentDetails.exams && studentDetails.exams.length > 0) {
                const studentExamsWithInfo = studentDetails.exams.map(exam => ({
                  ...exam,
                  studentId: student.id,
                  studentName: `${student.firstName} ${student.lastName}`,
                  studentClass: student.class,
                  studentEmail: student.email
                }));
                allExams.push(...studentExamsWithInfo);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch exams for student ${student.id}:`, error);
          }
        }
        
        setExams(allExams);
        
        // Calculate statistics
        const completedExams = allExams.filter(e => e.status === 'completed');
        const totalExams = completedExams.length;
        const averageScore = totalExams > 0 
          ? completedExams.reduce((sum, e) => sum + (e.percentage || 0), 0) / totalExams 
          : 0;
        const passRate = totalExams > 0 
          ? (completedExams.filter(e => (e.percentage || 0) >= 50).length / totalExams) * 100 
          : 0;
        const distinctionRate = totalExams > 0 
          ? (completedExams.filter(e => (e.percentage || 0) >= 75).length / totalExams) * 100 
          : 0;
        
        setStats({
          totalExams,
          averageScore: Math.round(averageScore),
          passRate: Math.round(passRate),
          distinctionRate: Math.round(distinctionRate)
        });
        
        setResults(allExams);
      }
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await fetchWithAuth(`/admin/students/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedStudent(data.student);
        setStudentExams(data.exams || []);
        setStudentPerformance(data.performance || null);
        setShowDetailsModal(true);
      } else {
        toast.error('Failed to load student details');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const classes = ['all', ...new Set(students.map(s => s.class).filter(Boolean))];
  const subjects = ['all', ...new Set(exams.map(e => e.subject).filter(Boolean))];

  const filteredResults = results.filter(r => {
    if (selectedClass !== 'all' && r.studentClass !== selectedClass) return false;
    if (selectedSubject !== 'all' && r.subject !== selectedSubject) return false;
    return r.status === 'completed';
  });

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-[#10b981] bg-[#D1FAE5]';
    if (score >= 60) return 'text-[#3B82F6] bg-[#DBEAFE]';
    if (score >= 50) return 'text-[#F59E0B] bg-[#FEF3C7]';
    return 'text-[#DC2626] bg-[#FEE2E2]';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleTimeString();
    }
    return new Date(timestamp).toLocaleTimeString();
  };

  const getGrade = (percentage) => {
    if (percentage >= 75) return { grade: 'A', color: 'text-[#10b981]' };
    if (percentage >= 60) return { grade: 'B', color: 'text-[#3B82F6]' };
    if (percentage >= 50) return { grade: 'C', color: 'text-[#F59E0B]' };
    if (percentage >= 40) return { grade: 'D', color: 'text-[#DC2626]' };
    return { grade: 'F', color: 'text-[#DC2626]' };
  };

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
          <div className="text-[32px] mb-2">📊</div>
          <div className="text-[24px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair mb-1">
            {stats.totalExams}
          </div>
          <div className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
            Total Exams
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-[32px] mb-2">📈</div>
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
            Pass Rate (≥50%)
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-[32px] mb-2">⭐</div>
          <div className="text-[24px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair mb-1">
            {stats.distinctionRate}%
          </div>
          <div className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
            Distinction (≥75%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {classes.map(cls => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`p-4 rounded-md border transition-all ${
              selectedClass === cls 
                ? 'border-[#10b981] bg-[#F0FDF4] text-[#10b981]' 
                : 'border-[#E8E8E8] bg-white text-[#626060] hover:border-[#10b981]'
            }`}
          >
            <div className="font-[600] text-[16px] leading-[120%] mb-1 font-playfair">
              {cls === 'all' ? 'All Classes' : cls}
            </div>
            <div className="text-[12px] leading-[140%] text-[#626060] font-[400] font-playfair">
              {cls === 'all' 
                ? students.length 
                : students.filter(s => s.class === cls).length} students
            </div>
          </button>
        ))}
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
        >
          <option value="all">All Subjects</option>
          {subjects.filter(s => s !== 'all').map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Student</th>
                <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Class</th>
                <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Subject</th>
                <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Score</th>
                <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Percentage</th>
                <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Grade</th>
                <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Date</th>
                <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => {
                const percentage = result.percentage || 0;
                const { grade, color } = getGrade(percentage);
                const scoreColor = getScoreColor(percentage);
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-[13px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">
                          {result.studentName}
                        </span>
                        <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">
                          {result.studentEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] leading-[100%] font-[500] text-[#626060] font-playfair">
                        {result.studentClass}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">
                        {result.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">
                        {result.score || 0} / {result.totalMarks || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[12px] leading-[100%] font-[600] ${scoreColor}`}>
                        {Math.round(percentage)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[13px] leading-[100%] font-[600] font-playfair ${color}`}>
                        {grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
                        {formatDate(result.endTime || result.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => fetchStudentDetails(result.studentId)}
                        className="text-[#10b981] text-[12px] leading-[100%] font-[500] hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredResults.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-[18px] leading-[120%] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Results Found</h3>
          <p className="text-[14px] leading-[140%] font-[400] text-[#626060] font-playfair">
            No exam results match your current filters.
          </p>
        </div>
      )}

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className={modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className={modalTitle}>Student Performance Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6 p-4 bg-[#F0FDF4] rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Student Name</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Email</p>
                  <p className="text-[14px] leading-[120%] font-[500] text-[#10b981] font-playfair">
                    {selectedStudent.email}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Class</p>
                  <p className="text-[14px] leading-[120%] font-[500] text-[#1E1E1E] font-playfair">
                    {selectedStudent.class}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Login ID</p>
                  <p className="text-[14px] leading-[120%] font-[500] text-[#1E1E1E] font-playfair">
                    {selectedStudent.loginId}
                  </p>
                </div>
              </div>
            </div>

            {studentPerformance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Total Exams</p>
                  <p className="text-[20px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair">
                    {studentPerformance.totalExams || 0}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Average Score</p>
                  <p className="text-[20px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair">
                    {Math.round((studentPerformance.averageScore || 0) * 100)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Subjects</p>
                  <p className="text-[20px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair">
                    {Object.keys(studentPerformance.subjects || {}).length}
                  </p>
                </div>
              </div>
            )}

            <h4 className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] mb-4 font-playfair">Exam History</h4>
            
            <div className="space-y-4">
              {studentExams.map((exam, index) => {
                const percentage = exam.percentage || 0;
                const { grade, color } = getGrade(percentage);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="text-[14px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">
                          {exam.subject}
                        </h5>
                        <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">
                          {formatDate(exam.startTime)} at {formatTime(exam.startTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[20px] leading-[120%] font-[700] ${color} font-playfair`}>
                          {grade}
                        </span>
                        <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">
                          {exam.score || 0}/{exam.totalMarks || 0} ({Math.round(percentage)}%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                      <div className="text-center">
                        <p className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">Duration</p>
                        <p className="text-[12px] leading-[120%] font-[500] text-[#1E1E1E] font-playfair">
                          {exam.duration} mins
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">Questions</p>
                        <p className="text-[12px] leading-[120%] font-[500] text-[#1E1E1E] font-playfair">
                          {exam.questionCount || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">Tab Switches</p>
                        <p className="text-[12px] leading-[120%] font-[500] text-[#1E1E1E] font-playfair">
                          {exam.tabSwitches || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">Status</p>
                        <p className="text-[12px] leading-[120%] font-[500] text-[#10b981] font-playfair">
                          {exam.status}
                        </p>
                      </div>
                    </div>

                    {exam.answers && Object.keys(exam.answers).length > 0 && (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          setTimeout(() => {
                            localStorage.setItem('view_exam_details', JSON.stringify(exam));
                            setActiveSection('performance');
                          }, 100);
                        }}
                        className="mt-3 text-[11px] text-[#10b981] hover:underline font-playfair"
                      >
                        View Detailed Answers →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={modalActions}>
              <button
                onClick={() => setShowDetailsModal(false)}
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