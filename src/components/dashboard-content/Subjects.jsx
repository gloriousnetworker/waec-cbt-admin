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
  examsSubtitle
} from '../styles';

export default function Subjects({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamType, setFilterExamType] = useState('all');

  const examTypes = ['WAEC', 'NECO', 'JAMB', 'GCE', 'Internal'];

  useEffect(() => {
    fetchSubjects();
  }, []);

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
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestions = (subject) => {
    localStorage.setItem('selected_subject', JSON.stringify(subject));
    setActiveSection('questions');
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search subjects by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] font-playfair text-[13px]"
          />
        </div>
        <select
          value={filterExamType}
          onChange={(e) => setFilterExamType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
        >
          <option value="all">All Exam Types</option>
          {examTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-[#626060] font-playfair">Loading subjects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">{subject.name}</h3>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">Code: {subject.code}</p>
                </div>
              </div>

              <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair mb-4 line-clamp-2">
                {subject.description || 'No description provided'}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] leading-[100%] font-[500]">
                  {subject.examType}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] leading-[100%] font-[500]">
                  {subject.duration} mins
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] leading-[100%] font-[500]">
                  {subject.questionCount || 0} questions
                </span>
                {subject.isGlobal && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-[9px] leading-[100%] font-[500]">
                    Global
                  </span>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewQuestions(subject)}
                  className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[11px] leading-[100%] font-[500]"
                >
                  Manage Questions
                </button>
              </div>
            </motion.div>
          ))}
          {filteredSubjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-[14px] text-[#626060] font-playfair">No subjects found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}