// components/dashboard-content/Performance.jsx
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
  homeStatsGrid,
  homeStatCard,
  homeStatCardTop,
  homeStatCardIcon,
  homeStatCardValue,
  homeStatCardLabel,
  homeContentGrid,
  homeCard,
  homeCardTitle
} from '../styles';

export default function Performance({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState(null);
  const [studentExams, setStudentExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedStudent = localStorage.getItem('selected_student');
    const storedPerformance = localStorage.getItem('student_performance');
    const storedExams = localStorage.getItem('student_exams');
    
    if (storedStudent) {
      setSelectedStudent(JSON.parse(storedStudent));
      setStudentPerformance(storedPerformance ? JSON.parse(storedPerformance) : null);
      setStudentExams(storedExams ? JSON.parse(storedExams) : []);
    }
  }, []);

  const fetchStudentDetails = async (studentId) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`/admin/students/${studentId}`);
      const data = await response.json();
      setStudentPerformance(data.performance);
      setStudentExams(data.exams || []);
    } catch (error) {
      toast.error('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedStudent) {
    return (
      <div className={examsContainer}>
        <div className={examsHeader}>
          <h1 className={examsTitle}>Performance Analytics</h1>
          <p className={examsSubtitle}>Select a student to view their performance</p>
        </div>
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-[18px] leading-[120%] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Student Selected</h3>
          <p className="text-[14px] leading-[140%] font-[400] text-[#626060] mb-4 font-playfair">
            Please select a student from the Students page to view their performance analytics.
          </p>
          <button
            onClick={() => setActiveSection('students')}
            className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors font-playfair text-[14px] leading-[100%] font-[600]"
          >
            Go to Students
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const subjects = studentPerformance?.subjects ? Object.entries(studentPerformance.subjects).map(([name, data]) => ({
    name,
    avgScore: data.totalScore && data.attempts ? Math.round(data.totalScore / data.attempts) : 0,
    totalExams: data.attempts || 0
  })) : [];

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => setActiveSection('students')}
            className="text-[#2563EB] text-[14px] leading-[100%] font-[500] hover:underline"
          >
            ← Back to Students
          </button>
          <h1 className={examsTitle}>Performance Analytics</h1>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[18px] leading-[100%] font-[600] font-playfair">
              {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
            </div>
            <div>
              <p className="text-[18px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </p>
              <p className="text-[13px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">
                {selectedStudent.class} • {selectedStudent.loginId} • {selectedStudent.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={homeStatsGrid}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>📚</span>
            <span className={homeStatCardValue}>{studentPerformance?.totalExams || 0}</span>
          </div>
          <p className={homeStatCardLabel}>Total Exams</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>📈</span>
            <span className={homeStatCardValue}>{studentPerformance?.averageScore ? Math.round(studentPerformance.averageScore) : 0}%</span>
          </div>
          <p className={homeStatCardLabel}>Average Score</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={homeStatCard}>
          <div className={homeStatCardTop}>
            <span className={homeStatCardIcon}>📖</span>
            <span className={homeStatCardValue}>{subjects.length}</span>
          </div>
          <p className={homeStatCardLabel}>Subjects</p>
        </motion.div>
      </div>

      <div className={homeContentGrid}>
        <div className={homeCard}>
          <h2 className={homeCardTitle}>Subject Performance</h2>
          <div className="space-y-4">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <div key={subject.name} className="p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">{subject.name}</span>
                    <span className={`text-[14px] leading-[100%] font-[600] ${
                      subject.avgScore >= 75 ? 'text-[#10B981]' : subject.avgScore >= 50 ? 'text-[#F59E0B]' : 'text-[#DC2626]'
                    } font-playfair`}>
                      {subject.avgScore}%
                    </span>
                  </div>
                  <div className="flex gap-4 text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mb-2">
                    <span>Exams: {subject.totalExams}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        subject.avgScore >= 75 ? 'bg-[#10B981]' : subject.avgScore >= 50 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
                      }`}
                      style={{ width: `${subject.avgScore}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[#626060] py-4">No exam data available</p>
            )}
          </div>
        </div>

        {studentExams.length > 0 && (
          <div className={homeCard}>
            <h2 className={homeCardTitle}>Recent Exams</h2>
            <div className="space-y-3">
              {studentExams.slice(0, 5).map((exam) => (
                <div key={exam.id} className="p-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">{exam.subject}</span>
                    <span className={`px-2 py-1 rounded-full text-[9px] leading-[100%] font-[500] ${
                      exam.score >= 75 ? 'bg-green-100 text-green-600' : exam.score >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {exam.score}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">
                    <span>{exam.examType}</span>
                    <span>{exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}