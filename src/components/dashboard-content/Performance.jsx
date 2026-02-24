'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
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
  const { user, fetchWithAuth } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState(null);
  const [studentExams, setStudentExams] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubject, setNewSubject] = useState('');
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

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetchWithAuth(`/admin/students/${selectedStudent.id}/subjects`, {
        method: 'POST',
        body: JSON.stringify({ subject: newSubject })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add subject');
      }

      const updatedStudent = { ...selectedStudent, subjects: data.subjects };
      setSelectedStudent(updatedStudent);
      localStorage.setItem('selected_student', JSON.stringify(updatedStudent));
      
      toast.success('Subject added successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setShowAddSubjectModal(false);
      setNewSubject('');
    }
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

  const subjects = selectedStudent.subjects?.map(subject => {
    const subjectExams = studentExams.filter(e => e.subject === subject);
    const avgScore = subjectExams.length > 0 
      ? Math.round(subjectExams.reduce((acc, e) => acc + e.score, 0) / subjectExams.length)
      : 0;
    const bestScore = subjectExams.length > 0 
      ? Math.max(...subjectExams.map(e => e.score))
      : 0;
    
    return {
      name: subject,
      avgScore,
      bestScore,
      totalExams: subjectExams.length
    };
  }) || [];

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
                {selectedStudent.firstName} {selectedStudent.lastName}
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
          { label: 'Total Exams', value: studentPerformance.totalExams || 0, icon: '📚' },
          { label: 'Average Score', value: `${studentPerformance.averageScore || 0}%`, icon: '📈' },
          { label: 'Subjects', value: subjects.length, icon: '📖' },
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
              <span className={homeStatCardValue}>{stat.value}</span>
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
            {subjects.map((subject) => (
              <div key={subject.name} className="p-4 bg-[#F9FAFB] rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">{subject.name}</span>
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
              </div>
            ))}
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
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}