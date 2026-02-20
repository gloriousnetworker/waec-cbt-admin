'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  homeCardTitle,
  modalOverlay,
  modalContainer,
  modalTitle,
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger
} from '../styles';

export default function Performance({ setActiveSection }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    const storedStudent = localStorage.getItem('selected_student');
    if (storedStudent) {
      const student = JSON.parse(storedStudent);
      setSelectedStudent(student);
      
      const examHistory = JSON.parse(localStorage.getItem(`exam_history_${student.id}`)) || [];
      
      const subjects = student.subjects.map(subject => {
        const subjectExams = examHistory.filter(e => e.subject === subject);
        const avgScore = subjectExams.length > 0 
          ? Math.round(subjectExams.reduce((acc, e) => acc + e.score, 0) / subjectExams.length)
          : 0;
        const bestScore = subjectExams.length > 0 
          ? Math.max(...subjectExams.map(e => e.score))
          : 0;
        const totalExams = subjectExams.length;
        
        return {
          name: subject,
          avgScore,
          bestScore,
          totalExams,
          recentScores: subjectExams.slice(-5).map(e => e.score)
        };
      });

      const totalExams = examHistory.length;
      const overallAvg = totalExams > 0 
        ? Math.round(examHistory.reduce((acc, e) => acc + e.score, 0) / totalExams)
        : 0;
      const bestOverall = totalExams > 0 
        ? Math.max(...examHistory.map(e => e.score))
        : 0;
      const passCount = examHistory.filter(e => e.score >= 50).length;
      const passRate = totalExams > 0 ? Math.round((passCount / totalExams) * 100) : 0;

      const recentExams = examHistory.slice(-10).reverse();

      setStudentPerformance({
        subjects,
        overallAvg,
        bestOverall,
        totalExams,
        passRate,
        recentExams
      });
    }
  }, []);

  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    const updatedSubjects = [...selectedStudent.subjects, newSubject];
    const updatedStudent = { ...selectedStudent, subjects: updatedSubjects };
    
    const students = JSON.parse(localStorage.getItem('school_students') || '[]');
    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    localStorage.setItem('school_students', JSON.stringify(updatedStudents));
    localStorage.setItem('selected_student', JSON.stringify(updatedStudent));
    setSelectedStudent(updatedStudent);
    
    const examHistory = JSON.parse(localStorage.getItem(`exam_history_${selectedStudent.id}`)) || [];
    const subjects = updatedSubjects.map(subject => {
      const subjectExams = examHistory.filter(e => e.subject === subject);
      const avgScore = subjectExams.length > 0 
        ? Math.round(subjectExams.reduce((acc, e) => acc + e.score, 0) / subjectExams.length)
        : 0;
      return {
        name: subject,
        avgScore,
        bestScore: subjectExams.length > 0 ? Math.max(...subjectExams.map(e => e.score)) : 0,
        totalExams: subjectExams.length,
        recentScores: subjectExams.slice(-5).map(e => e.score)
      };
    });
    
    setStudentPerformance(prev => ({
      ...prev,
      subjects
    }));
    
    setShowAddSubjectModal(false);
    setNewSubject('');
    toast.success('Subject added successfully!');
  };

  const handleDeleteSubject = () => {
    if (selectedSubject === 'Mathematics' || selectedSubject === 'English') {
      toast.error('Mathematics and English cannot be deleted');
      setShowDeleteSubjectModal(false);
      return;
    }

    const updatedSubjects = selectedStudent.subjects.filter(s => s !== selectedSubject);
    const updatedStudent = { ...selectedStudent, subjects: updatedSubjects };
    
    const students = JSON.parse(localStorage.getItem('school_students') || '[]');
    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    localStorage.setItem('school_students', JSON.stringify(updatedStudents));
    localStorage.setItem('selected_student', JSON.stringify(updatedStudent));
    setSelectedStudent(updatedStudent);
    
    const examHistory = JSON.parse(localStorage.getItem(`exam_history_${selectedStudent.id}`)) || [];
    const subjects = updatedSubjects.map(subject => {
      const subjectExams = examHistory.filter(e => e.subject === subject);
      const avgScore = subjectExams.length > 0 
        ? Math.round(subjectExams.reduce((acc, e) => acc + e.score, 0) / subjectExams.length)
        : 0;
      return {
        name: subject,
        avgScore,
        bestScore: subjectExams.length > 0 ? Math.max(...subjectExams.map(e => e.score)) : 0,
        totalExams: subjectExams.length,
        recentScores: subjectExams.slice(-5).map(e => e.score)
      };
    });
    
    setStudentPerformance(prev => ({
      ...prev,
      subjects
    }));
    
    setShowDeleteSubjectModal(false);
    setSelectedSubject(null);
    toast.success('Subject deleted successfully!');
  };

  if (!selectedStudent || !studentPerformance) {
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
              {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
            </div>
            <div>
              <p className="text-[18px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">
                {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
              </p>
              <p className="text-[13px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">
                {selectedStudent.class} • {selectedStudent.loginId} • {selectedStudent.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors font-playfair text-[13px] leading-[100%] font-[600]"
          >
            + Add Subject
          </button>
        </div>
      </div>

      <div className={homeStatsGrid}>
        {[
          { label: 'Total Exams', value: studentPerformance.totalExams, icon: '📚' },
          { label: 'Average Score', value: `${studentPerformance.overallAvg}%`, icon: '📈' },
          { label: 'Best Score', value: `${studentPerformance.bestOverall}%`, icon: '🏆' },
          { label: 'Pass Rate', value: `${studentPerformance.passRate}%`, icon: '✅' },
          { label: 'Subjects', value: studentPerformance.subjects.length, icon: '📖' },
          { label: 'Current Grade', value: studentPerformance.overallAvg >= 75 ? 'A' : studentPerformance.overallAvg >= 60 ? 'B' : studentPerformance.overallAvg >= 50 ? 'C' : 'D', icon: '🎯' },
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
              <span className={`${homeStatCardValue} ${
                stat.label === 'Average Score' || stat.label === 'Best Score' || stat.label === 'Pass Rate'
                  ? parseInt(stat.value) >= 75 ? 'text-[#10B981]' : parseInt(stat.value) >= 50 ? 'text-[#F59E0B]' : 'text-[#DC2626]'
                  : ''
              }`}>
                {stat.value}
              </span>
            </div>
            <p className={homeStatCardLabel}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className={homeContentGrid}>
        <div className={homeCard}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={homeCardTitle}>Subject Performance</h2>
          </div>
          <div className="space-y-4">
            {studentPerformance.subjects.map((subject) => (
              <div key={subject.name} className="p-4 bg-[#F9FAFB] rounded-lg relative group">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">{subject.name}</span>
                    {subject.name !== 'Mathematics' && subject.name !== 'English' && (
                      <button
                        onClick={() => {
                          setSelectedSubject(subject.name);
                          setShowDeleteSubjectModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[#DC2626] text-[12px] hover:underline transition-opacity"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <span className={`text-[14px] leading-[100%] font-[600] ${
                    subject.avgScore >= 75 ? 'text-[#10B981]' : subject.avgScore >= 50 ? 'text-[#F59E0B]' : 'text-[#DC2626]'
                  } font-playfair`}>
                    {subject.avgScore}%
                  </span>
                </div>
                <div className="flex gap-4 text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair">
                  <span>Best: {subject.bestScore}%</span>
                  <span>Exams: {subject.totalExams}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      subject.avgScore >= 75 ? 'bg-[#10B981]' : subject.avgScore >= 50 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
                    }`}
                    style={{ width: `${subject.avgScore}%` }}
                  />
                </div>
                {subject.recentScores.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {subject.recentScores.map((score, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div className={`text-[9px] leading-[100%] font-[400] ${
                          score >= 75 ? 'text-[#10B981]' : score >= 50 ? 'text-[#F59E0B]' : 'text-[#DC2626]'
                        } font-playfair`}>
                          {score}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={homeCard}>
          <h2 className={homeCardTitle}>Recent Exam History</h2>
          <div className="space-y-3">
            {studentPerformance.recentExams.map((exam, index) => (
              <div key={index} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">{exam.subject}</span>
                  <span className={`text-[13px] leading-[100%] font-[600] ${
                    exam.score >= 75 ? 'text-[#10B981]' : exam.score >= 50 ? 'text-[#F59E0B]' : 'text-[#DC2626]'
                  } font-playfair`}>
                    {exam.score}%
                  </span>
                </div>
                <div className="flex justify-between text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">
                  <span>{exam.date}</span>
                  <span>{exam.duration}</span>
                </div>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      exam.score >= 75 ? 'bg-[#10B981]' : exam.score >= 50 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
                    }`}
                    style={{ width: `${exam.score}%` }}
                  />
                </div>
              </div>
            ))}
            {studentPerformance.recentExams.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[13px] leading-[140%] font-[400] text-[#626060] font-playfair">
                  No exams taken yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] mb-4 font-playfair">Performance Insights</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#EFF6FF] rounded-lg">
            <div className="text-[24px] mb-2">📈</div>
            <h3 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">Strengths</h3>
            <ul className="space-y-1">
              {studentPerformance.subjects
                .filter(s => s.avgScore >= 70)
                .map(s => (
                  <li key={s.name} className="text-[12px] leading-[100%] font-[400] text-[#2563EB] font-playfair">
                    • {s.name} ({s.avgScore}%)
                  </li>
                ))}
              {studentPerformance.subjects.filter(s => s.avgScore >= 70).length === 0 && (
                <li className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
                  No strengths identified yet
                </li>
              )}
            </ul>
          </div>
          <div className="p-4 bg-[#FEF2F2] rounded-lg">
            <div className="text-[24px] mb-2">📉</div>
            <h3 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">Areas for Improvement</h3>
            <ul className="space-y-1">
              {studentPerformance.subjects
                .filter(s => s.avgScore < 50)
                .map(s => (
                  <li key={s.name} className="text-[12px] leading-[100%] font-[400] text-[#DC2626] font-playfair">
                    • {s.name} ({s.avgScore}%)
                  </li>
                ))}
              {studentPerformance.subjects.filter(s => s.avgScore < 50).length === 0 && (
                <li className="text-[12px] leading-[100%] font-[400] text-[#10B981] font-playfair">
                  All subjects above 50%! Great job!
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddSubjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={modalContainer}
            >
              <h3 className={modalTitle}>Add New Subject</h3>
              <div className="mb-6">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter subject name (e.g., Physics, Chemistry)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2563EB] text-[14px] font-playfair"
                />
              </div>
              <div className={modalActions}>
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubject}
                  className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors font-playfair text-[14px] leading-[100%] font-[600]"
                >
                  Add Subject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteSubjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={modalContainer}
            >
              <h3 className={modalTitle}>Delete Subject</h3>
              <p className={modalText}>
                Are you sure you want to delete {selectedSubject}? This will remove all exam history for this subject.
              </p>
              <div className={modalActions}>
                <button
                  onClick={() => setShowDeleteSubjectModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubject}
                  className={modalButtonDanger}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}