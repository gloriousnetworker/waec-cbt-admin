// components/dashboard-content/Questions.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger
} from '../../styles/styles';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' } }),
};

export default function Questions({ setActiveSection }) {
  const { user, fetchWithAuth } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [bulkImportData, setBulkImportData] = useState('');
  const [bulkImportFile, setBulkImportFile] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    difficulty: 'easy',
    topic: '',
    class: 'General',
    mode: 'exam',
    explanation: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginatedQuestions, setPaginatedQuestions] = useState([]);

  const difficulties = ['easy', 'medium', 'hard'];
  const modes = ['exam', 'practice'];
  const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3', 'General'];

  // Check if user can use bulk import (not allowed for monthly plan)
  const canUseBulkImport = user?.subscription?.plan !== 'monthly';

  useEffect(() => {
    const storedSubject = localStorage.getItem('selected_subject');
    if (storedSubject) {
      const subject = JSON.parse(storedSubject);
      setSelectedSubject(subject);
      setFormData(prev => ({
        ...prev,
        subjectId: subject.id,
        class: subject.class || 'General',
        mode: 'exam'
      }));
      setFilterSubject(subject.id);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = filteredQuestions;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setPaginatedQuestions(filtered.slice(indexOfFirstItem, indexOfLastItem));
  }, [questions, searchTerm, filterSubject, filterMode, filterDifficulty, currentPage, itemsPerPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsRes, subjectsRes] = await Promise.all([
        fetchWithAuth('/admin/questions'),
        fetchWithAuth('/admin/subjects')
      ]);

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setQuestions(questionsData.questions || []);
      }
      
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'marks', 'difficulty', 'topic', 'class', 'mode', 'explanation'];
    const exampleRow = [
      'What is the SI unit of force?',
      'Newton',
      'Joule',
      'Watt',
      'Pascal',
      'Newton',
      '2',
      'easy',
      'Mechanics',
      'General',
      'exam',
      'The Newton is the SI unit of force, named after Sir Isaac Newton'
    ];
    
    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBulkImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      const questions = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length < 8) continue;
        
        const question = {
          question: values[0],
          options: [values[1], values[2], values[3], values[4]],
          correctAnswer: values[5],
          marks: parseInt(values[6]) || 1,
          difficulty: values[7] || 'easy',
          topic: values[8] || '',
          class: values[9] || 'General',
          mode: values[10] || 'exam',
          explanation: values[11] || ''
        };
        
        questions.push(question);
      }
      
      setBulkImportData(JSON.stringify(questions, null, 2));
    };
    
    reader.readAsText(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const validateForm = () => {
    if (!selectedSubject && !formData.subjectId) {
      toast.error('Please select a subject from the filter first');
      return false;
    }

    if (!formData.subjectId && selectedSubject) {
      setFormData(prev => ({ ...prev, subjectId: selectedSubject.id }));
    }

    if (!formData.question || formData.question.trim() === '') {
      toast.error('Please enter the question');
      return false;
    }
    
    if (formData.options.some(opt => !opt || opt.trim() === '')) {
      toast.error('Please fill in all four options');
      return false;
    }
    
    if (!formData.correctAnswer || formData.correctAnswer.trim() === '') {
      toast.error('Please enter the correct answer');
      return false;
    }
    
    const correctAnswerExists = formData.options.some(
      opt => opt.trim().toLowerCase() === formData.correctAnswer.trim().toLowerCase()
    );
    
    if (!correctAnswerExists) {
      toast.error('Correct answer must match one of the options exactly');
      return false;
    }
    
    if (!formData.class) {
      toast.error('Please select a class');
      return false;
    }
    
    if (!formData.mode) {
      toast.error('Please select a mode');
      return false;
    }

    if (!formData.marks || formData.marks < 1) {
      toast.error('Marks must be at least 1');
      return false;
    }
    
    return true;
  };

  const handleCreateQuestion = async () => {
    if (!formData.subjectId && selectedSubject) {
      setFormData(prev => ({ ...prev, subjectId: selectedSubject.id }));
    }

    if (!validateForm()) return;

    const marksValue = parseInt(formData.marks);
    if (isNaN(marksValue) || marksValue < 1) {
      toast.error('Please enter a valid number for marks');
      return;
    }

    const questionData = {
      subjectId: formData.subjectId || selectedSubject.id,
      question: formData.question.trim(),
      options: formData.options.map(opt => opt.trim()),
      correctAnswer: formData.correctAnswer.trim(),
      marks: marksValue,
      difficulty: formData.difficulty,
      topic: formData.topic.trim() || 'General',
      class: formData.class,
      mode: formData.mode,
      explanation: formData.explanation.trim() || ''
    };

    const toastId = toast.loading('Creating question...');

    try {
      const response = await fetchWithAuth('/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Question created successfully!', { id: toastId });
        setShowCreateModal(false);
        setFormData({
          subjectId: selectedSubject?.id || '',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          marks: 1,
          difficulty: 'easy',
          topic: '',
          class: selectedSubject?.class || 'General',
          mode: 'exam',
          explanation: ''
        });
        fetchData();
        setCurrentPage(1);
      } else {
        toast.error(data.message || 'Failed to create question', { id: toastId });
      }
    } catch (error) {
      console.error('Create question error:', error);
      toast.error('Network error', { id: toastId });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!validateForm()) return;

    const marksValue = parseInt(formData.marks);
    if (isNaN(marksValue) || marksValue < 1) {
      toast.error('Please enter a valid number for marks');
      return;
    }

    const questionData = {
      subjectId: formData.subjectId || selectedSubject.id,
      question: formData.question.trim(),
      options: formData.options.map(opt => opt.trim()),
      correctAnswer: formData.correctAnswer.trim(),
      marks: marksValue,
      difficulty: formData.difficulty,
      topic: formData.topic.trim() || 'General',
      class: formData.class,
      mode: formData.mode,
      explanation: formData.explanation.trim() || ''
    };

    const toastId = toast.loading('Updating question...');

    try {
      const response = await fetchWithAuth(`/admin/questions/${selectedQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Question updated successfully!', { id: toastId });
        setShowEditModal(false);
        setSelectedQuestion(null);
        setFormData({
          subjectId: selectedSubject?.id || '',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          marks: 1,
          difficulty: 'easy',
          topic: '',
          class: selectedSubject?.class || 'General',
          mode: 'exam',
          explanation: ''
        });
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update question', { id: toastId });
      }
    } catch (error) {
      console.error('Update question error:', error);
      toast.error('Network error', { id: toastId });
    }
  };

  const handleDeleteQuestion = async () => {
    const toastId = toast.loading('Deleting question...');

    try {
      const response = await fetchWithAuth(`/admin/questions/${selectedQuestion.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Question deleted successfully!', { id: toastId });
        setShowDeleteModal(false);
        setSelectedQuestion(null);
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete question', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleBulkImport = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject from the filter');
      return;
    }

    if (!canUseBulkImport) {
      toast.error('Bulk import is not available on the Monthly plan. Please upgrade to Termly, Yearly, or Unlimited plan to use this feature.');
      return;
    }

    let questions;
    try {
      questions = JSON.parse(bulkImportData);
      if (!Array.isArray(questions)) {
        throw new Error('Data must be an array');
      }

      questions.forEach((q, index) => {
        if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${index + 1}: Missing question or invalid options`);
        }
        if (!q.correctAnswer) {
          throw new Error(`Question ${index + 1}: Missing correct answer`);
        }
        if (!q.options.includes(q.correctAnswer)) {
          throw new Error(`Question ${index + 1}: Correct answer must be one of the options`);
        }
        if (!q.marks || isNaN(parseInt(q.marks)) || parseInt(q.marks) < 1) {
          throw new Error(`Question ${index + 1}: Invalid marks value`);
        }
        q.marks = parseInt(q.marks);
      });

    } catch (error) {
      toast.error(error.message || 'Invalid JSON format');
      return;
    }

    const toastId = toast.loading('Importing questions...');

    try {
      const response = await fetchWithAuth('/admin/questions/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectId: selectedSubject.id,
          questions
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully imported ${data.count} questions!`, { id: toastId });
        setShowBulkImportModal(false);
        setBulkImportData('');
        setBulkImportFile(null);
        fetchData();
        setCurrentPage(1);
      } else {
        toast.error(data.message || 'Failed to import questions', { id: toastId });
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('Network error', { id: toastId });
    }
  };

  const openEditModal = (question) => {
    setSelectedQuestion(question);
    setFormData({
      subjectId: question.subjectId || selectedSubject?.id || '',
      question: question.question || '',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      marks: question.marks || 1,
      difficulty: question.difficulty || 'easy',
      topic: question.topic || '',
      class: question.class || 'General',
      mode: question.mode || 'exam',
      explanation: question.explanation || ''
    });
    setShowEditModal(true);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || q.subjectId === filterSubject;
    const matchesMode = filterMode === 'all' || q.mode === filterMode;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesSubject && matchesMode && matchesDifficulty;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getSubscriptionPlanName = () => {
    if (!user?.subscription?.plan) return 'No Plan';
    const plan = user.subscription.plan;
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Question Bank</h1>
        <p className={examsSubtitle}>
          {selectedSubject ? `Managing questions for ${selectedSubject.name}` : 'Create and manage questions'}
        </p>
        {!canUseBulkImport && (
          <div className="mt-2 p-2 bg-warning-light border border-yellow-200 rounded-md">
            <p className="text-[11px] text-yellow-700">
              ⚠️ Bulk import is not available on your {getSubscriptionPlanName()} plan. 
              <button 
                onClick={() => setActiveSection('subscription')}
                className="ml-2 text-yellow-800 font-[600] hover:underline"
              >
                Upgrade to access
              </button>
            </p>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!canUseBulkImport) {
                  toast.error('Bulk import is not available on your current plan. Please upgrade to access this feature.');
                  return;
                }
                setShowBulkImportModal(true);
              }}
              className={`px-4 py-2 rounded-md text-[13px] leading-[100%] font-[600] transition-colors ${
                canUseBulkImport 
                  ? 'bg-brand-accent text-white hover:bg-[#7C3AED]' 
                  : 'bg-gray-300 text-content-muted cursor-not-allowed'
              }`}
              title={!canUseBulkImport ? 'Upgrade to Termly plan or higher to use bulk import' : ''}
            >
              📦 Bulk Import
              {!canUseBulkImport && ' (Upgrade Required)'}
            </button>
            <button
              onClick={() => {
                if (!selectedSubject) {
                  toast.error('Please select a subject from the filter first');
                  return;
                }
                setFormData(prev => ({ ...prev, subjectId: selectedSubject.id }));
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-[13px] leading-[100%] font-[600]"
            >
              + Add Question
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setCurrentPage(1);
              const subject = subjects.find(s => s.id === e.target.value);
              setSelectedSubject(subject);
              if (subject) {
                setFormData(prev => ({ ...prev, subjectId: subject.id, class: subject.class || 'General' }));
              }
            }}
            className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <select
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
          >
            <option value="all">All Modes</option>
            {modes.map(mode => (
              <option key={mode} value={mode}>{mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => {
              setFilterDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
          >
            <option value="all">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-border p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-content-muted">Loading questions...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-[13px] text-content-muted">
              Showing {paginatedQuestions.length} of {filteredQuestions.length} questions
            </p>
            {filteredQuestions.length > 0 && (
              <p className="text-[13px] text-content-muted">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {paginatedQuestions.map((question, i) => (
              <motion.div
                key={question.id}
                custom={i} variants={cardVariants} initial="hidden" animate="visible"
                className="bg-white rounded-lg border border-border p-6 hover:shadow-card-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-[16px] leading-[120%] font-[600] text-content-primary">
                        {question.question}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-[9px] leading-[100%] font-[500] ${
                        question.difficulty === 'easy' ? 'bg-success-light text-success' :
                        question.difficulty === 'medium' ? 'bg-warning-light text-warning-dark' :
                        'bg-danger-light text-danger'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-[9px] leading-[100%] font-[500] ${
                        question.mode === 'exam' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {question.mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}
                      </span>
                      <span className="px-2 py-1 bg-surface-subtle text-content-secondary rounded-full text-[9px] leading-[100%] font-[500]">
                        {question.marks} mark{question.marks > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-[11px] leading-[100%] font-[400] text-content-muted mb-2">
                      Subject: {subjects.find(s => s.id === question.subjectId)?.name || 'N/A'} • Class: {question.class} • Topic: {question.topic || 'General'}
                    </p>
                    <div className="space-y-2 mb-3">
                      {question.options?.map((option, idx) => (
                        <div key={idx} className={`p-3 rounded-md text-[13px] leading-[140%] font-[400] ${
                          option === question.correctAnswer ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-surface-muted text-content-primary'
                        }`}>
                          {String.fromCharCode(65 + idx)}. {option}
                          {option === question.correctAnswer && ' ✓'}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md text-[12px] leading-[140%] font-[400]">
                        <span className="font-[600]">Explanation:</span> {question.explanation}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(question)}
                      className="p-2 text-brand-primary hover:bg-brand-primary-lt rounded-md transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuestion(question);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-border">
              <p className="text-[14px] text-content-muted">No questions found</p>
            </div>
          )}

          {filteredQuestions.length > itemsPerPage && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-[13px] font-[600] transition-colors ${
                  currentPage === 1
                    ? 'bg-surface-subtle text-content-muted cursor-not-allowed'
                    : 'bg-brand-primary text-white hover:bg-brand-primary-dk'
                }`}
              >
                ← Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-10 h-10 rounded-md text-[13px] font-[600] transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-brand-primary text-white'
                            : 'bg-white border border-border text-content-muted hover:border-brand-primary hover:text-brand-primary'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="w-10 h-10 flex items-center justify-center text-content-muted">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-[13px] font-[600] transition-colors ${
                  currentPage === totalPages
                    ? 'bg-surface-subtle text-content-muted cursor-not-allowed'
                    : 'bg-brand-primary text-white hover:bg-brand-primary-dk'
                }`}
              >
                Next →
              </button>
            </div>
          )}

          {filteredQuestions.length > 0 && (
            <div className="mt-4 text-center text-[11px] text-content-muted">
              Showing {Math.min(itemsPerPage, filteredQuestions.length)} items per page
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Create New Question</h3>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Subject</label>
                    <input
                      type="text"
                      value={selectedSubject?.name || 'No subject selected'}
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-md bg-surface-subtle text-[13px]"
                    />
                    <input type="hidden" name="subjectId" value={selectedSubject?.id || ''} />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Mode *</label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    >
                      <option value="exam">Exam Mode</option>
                      <option value="practice">Practice Mode</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Question *</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    placeholder="Enter the question text"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[12px] leading-[100%] font-[500] text-content-primary">Options *</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-6 text-[13px] font-[600] text-content-muted">{String.fromCharCode(65 + index)}.</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Correct Answer *</label>
                  <input
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    placeholder="Enter the exact correct answer text"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Marks *</label>
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Class *</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    >
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    placeholder="e.g., Mechanics, Algebra"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Explanation</label>
                  <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    placeholder="Explain why the correct answer is right (optional)"
                  />
                </div>
              </div>

              <div className={modalActions}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateQuestion}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-[13px] leading-[100%] font-[600]"
                >
                  Create Question
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showBulkImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => {
              setShowBulkImportModal(false);
              setBulkImportData('');
              setBulkImportFile(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Bulk Import Questions</h3>
              
              <div className="mb-6">
                <div className={`p-4 rounded-lg mb-4 ${selectedSubject ? 'bg-green-50' : 'bg-warning-light'}`}>
                  <p className="text-[12px]">
                    <strong>Subject Selected:</strong> {selectedSubject?.name || 'None'} 
                    {selectedSubject && ` (${selectedSubject.examType})`}
                  </p>
                  {!selectedSubject && (
                    <p className="text-[12px] text-red-600 mt-1">
                      Please select a subject from the filter before importing.
                    </p>
                  )}
                  {!canUseBulkImport && (
                    <p className="text-[12px] text-red-600 mt-2">
                      ⚠️ Bulk import is not available on your current plan. Please upgrade to access this feature.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={downloadCSVTemplate}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-[13px] leading-[100%] font-[600]"
                  >
                    📥 Download CSV Template
                  </button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={!canUseBulkImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button className={`px-4 py-2 rounded-md text-[13px] leading-[100%] font-[600] ${
                      canUseBulkImport 
                        ? 'bg-brand-primary text-white hover:bg-brand-primary-dk' 
                        : 'bg-gray-300 text-content-muted cursor-not-allowed'
                    }`}>
                      📤 Upload CSV
                    </button>
                  </div>
                </div>

                <div className="bg-surface-muted p-4 rounded-lg mb-4">
                  <p className="text-[11px] text-content-muted mb-2">
                    <strong>CSV Format:</strong> question, optionA, optionB, optionC, optionD, correctAnswer, marks, difficulty (easy/medium/hard), topic, class, mode (exam/practice), explanation
                  </p>
                  <p className="text-[10px] text-content-muted mt-2">
                    Example: "What is the SI unit of force?","Newton","Joule","Watt","Pascal","Newton",2,"easy","Mechanics","General","exam","The Newton is the SI unit of force"
                  </p>
                </div>

                {bulkImportFile && (
                  <div className="bg-blue-50 p-2 rounded-md mb-4">
                    <p className="text-[11px] text-blue-700">
                      File uploaded: {bulkImportFile.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Questions Data (JSON Preview)</label>
                  <textarea
                    value={bulkImportData}
                    onChange={(e) => setBulkImportData(e.target.value)}
                    rows="8"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[12px] font-mono"
                    placeholder={JSON.stringify([
                      {
                        question: "What is the SI unit of force?",
                        options: ["Newton", "Joule", "Watt", "Pascal"],
                        correctAnswer: "Newton",
                        marks: 2,
                        difficulty: "easy",
                        topic: "Mechanics",
                        class: "General",
                        mode: "exam",
                        explanation: "The Newton is the SI unit of force"
                      }
                    ], null, 2)}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-[12px] text-blue-700">
                    <strong>Required Fields:</strong> question (string), options (array of 4 strings), correctAnswer (string), marks (number), difficulty (easy/medium/hard), class (string), mode (exam/practice). Topic and explanation are optional.
                  </p>
                </div>
              </div>

              <div className={modalActions}>
                <button
                  onClick={() => {
                    setShowBulkImportModal(false);
                    setBulkImportData('');
                    setBulkImportFile(null);
                  }}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={!selectedSubject || !bulkImportData.trim() || !canUseBulkImport}
                  className={`px-4 py-2 rounded-md text-[13px] leading-[100%] font-[600] ${
                    (!selectedSubject || !bulkImportData.trim() || !canUseBulkImport)
                      ? 'bg-gray-300 text-content-muted cursor-not-allowed' 
                      : 'bg-brand-accent text-white hover:bg-[#7C3AED]'
                  }`}
                >
                  Import Questions
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Edit Question</h3>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Mode</label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    >
                      <option value="exam">Exam Mode</option>
                      <option value="practice">Practice Mode</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Class *</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    >
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Question *</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[12px] leading-[100%] font-[500] text-content-primary">Options *</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-6 text-[13px] font-[600] text-content-muted">{String.fromCharCode(65 + index)}.</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Correct Answer *</label>
                  <input
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Marks *</label>
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Topic</label>
                    <input
                      type="text"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Explanation</label>
                  <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    placeholder="Explain why the correct answer is right"
                  />
                </div>
              </div>

              <div className={modalActions}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateQuestion}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-[13px] leading-[100%] font-[600]"
                >
                  Update Question
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={modalContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Delete Question</h3>
              <p className={modalText}>
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className={modalActions}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuestion}
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