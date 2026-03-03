// components/dashboard-content/Results.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  examsContainer,
  examsHeader,
  examsTitle,
  examsSubtitle
} from '../styles';

export default function Results({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, examsRes] = await Promise.all([
        fetchWithAuth('/admin/students'),
        fetchWithAuth('/admin/exams')
      ]);

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);
      }
      
      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData.exams || []);
        
        // Build results array
        const resultsData = examsData.exams?.map(exam => {
          const student = studentsData.students?.find(s => s.id === exam.studentId);
          return {
            ...exam,
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
            studentClass: student?.class || 'N/A'
          };
        }) || [];
        
        setResults(resultsData);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const classes = ['all', ...new Set(students.map(s => s.class))];
  const subjects = ['all', ...new Set(exams.map(e => e.subject))];

  const filteredResults = results.filter(r => {
    if (selectedClass !== 'all' && r.studentClass !== selectedClass) return false;
    if (selectedSubject !== 'all' && r.subject !== selectedSubject) return false;
    return true;
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
              {cls === 'all' ? students.length : students.filter(s => s.class === cls).length} students
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
              const scorePercentage = result.percentage || (result.score / result.totalMarks * 100) || 0;
              const grade = scorePercentage >= 75 ? 'A' : scorePercentage >= 60 ? 'B' : scorePercentage >= 50 ? 'C' : scorePercentage >= 40 ? 'D' : 'F';
              const scoreColor = getScoreColor(scorePercentage);
              
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-[13px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">
                      {result.studentName}
                    </span>
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
                      {result.score} / {result.totalMarks}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] leading-[100%] font-[600] ${scoreColor}`}>
                      {Math.round(scorePercentage)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[13px] leading-[100%] font-[600] font-playfair ${
                      grade === 'A' ? 'text-[#10b981]' : 
                      grade === 'B' ? 'text-[#3B82F6]' : 
                      grade === 'C' ? 'text-[#F59E0B]' : 
                      'text-[#DC2626]'
                    }`}>
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
                      onClick={() => {
                        const student = students.find(s => s.id === result.studentId);
                        if (student) {
                          localStorage.setItem('selected_student', JSON.stringify(student));
                          setActiveSection('performance');
                        }
                      }}
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

      {filteredResults.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-[18px] leading-[120%] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Results Found</h3>
          <p className="text-[14px] leading-[140%] font-[400] text-[#626060] font-playfair">
            No exam results match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}