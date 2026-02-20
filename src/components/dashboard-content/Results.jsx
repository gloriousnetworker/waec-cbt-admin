'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  examsContainer,
  examsHeader,
  examsTitle,
  examsSubtitle
} from '../styles';

export default function Results({ setActiveSection }) {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem('school_students') || '[]');
    setStudents(storedStudents);
    
    const allResults = [];
    storedStudents.forEach(student => {
      const examHistory = JSON.parse(localStorage.getItem(`exam_history_${student.id}`)) || [];
      examHistory.forEach(exam => {
        allResults.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentClass: student.class,
          ...exam
        });
      });
    });
    
    setResults(allResults);
  }, []);

  const classes = ['all', ...new Set(students.map(s => s.class))];
  const exams = ['all', ...new Set(results.map(r => r.subject))];

  const filteredResults = results.filter(r => {
    if (selectedClass !== 'all' && r.studentClass !== selectedClass) return false;
    if (selectedExam !== 'all' && r.subject !== selectedExam) return false;
    return true;
  });

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-[#10B981] bg-[#D1FAE5]';
    if (score >= 60) return 'text-[#2563EB] bg-[#DBEAFE]';
    if (score >= 50) return 'text-[#F59E0B] bg-[#FEF3C7]';
    return 'text-[#DC2626] bg-[#FEE2E2]';
  };

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
                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' 
                : 'border-[#E8E8E8] bg-white text-[#626060] hover:border-[#2563EB]'
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
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
        >
          {exams.map(exam => (
            <option key={exam} value={exam}>{exam === 'all' ? 'All Subjects' : exam}</option>
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
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Grade</th>
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Date</th>
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => {
              const grade = result.score >= 75 ? 'A' : result.score >= 60 ? 'B' : result.score >= 50 ? 'C' : result.score >= 40 ? 'D' : 'F';
              const scoreColor = getScoreColor(result.score);
              
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
                    <span className={`px-3 py-1 rounded-full text-[12px] leading-[100%] font-[600] ${scoreColor}`}>
                      {result.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[13px] leading-[100%] font-[700] ${
                      grade === 'A' ? 'text-[#10B981]' : grade === 'B' ? 'text-[#2563EB]' : grade === 'C' ? 'text-[#F59E0B]' : 'text-[#DC2626]'
                    } font-playfair`}>
                      {grade}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
                      {result.date}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        const student = students.find(s => s.id === result.studentId);
                        localStorage.setItem('selected_student', JSON.stringify(student));
                        setActiveSection('performance');
                      }}
                      className="text-[#2563EB] text-[12px] leading-[100%] font-[500] hover:underline"
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