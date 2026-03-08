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
} from '../styles';

export default function Questions({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
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
    mode: 'exam'
  });

  const difficulties = ['easy', 'medium', 'hard'];
  const modes = ['exam', 'practice'];

  useEffect(() => {
    const storedSubject = localStorage.getItem('selected_subject');
    if (storedSubject) {
      const subject = JSON.parse(storedSubject);
      setSelectedSubject(subject);
      setFormData(prev => ({
        ...prev,
        subjectId: subject.id,
        class: 'General',
        mode: 'exam'
      }));
      setFilterSubject(subject.id);
    }
    fetchData();
  }, []);

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
    const headers = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'marks', 'difficulty', 'topic', 'class', 'mode'];
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
      'exam'
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
        if (values.length < 7) continue;
        
        const question = {
          question: values[0],
          options: [values[1], values[2], values[3], values[4]],
          correctAnswer: values[5],
          marks: parseInt(values[6]) || 1,
          difficulty: values[7] || 'easy',
          topic: values[8] || '',
          class: values[9] || 'General',
          mode: values[10] || 'exam'
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

  const handleCreateQuestion = async () => {
    if (!formData.subjectId || !formData.question || formData.options.some(opt => !opt) || !formData.correctAnswer) {
      toast.error('Please fill in all required fields');
      return;
    }

    const toastId = toast.loading('Creating question...');

    try {
      const response = await fetchWithAuth('/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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
          class: 'General',
          mode: 'exam'
        });
        fetchData();
      } else {
        toast.error(data.message || 'Failed to create question', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!formData.question || formData.options.some(opt => !opt) || !formData.correctAnswer) {
      toast.error('Please fill in all required fields');
      return;
    }

    const toastId = toast.loading('Updating question...');

    try {
      const response = await fetchWithAuth(`/admin/questions/${selectedQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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
          class: 'General',
          mode: 'exam'
        });
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update question', { id: toastId });
      }
    } catch (error) {
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

    let questions;
    try {
      questions = JSON.parse(bulkImportData);
      if (!Array.isArray(questions)) {
        throw new Error('Data must be an array');
      }
    } catch (error) {
      toast.error('Invalid JSON format');
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
      } else {
        toast.error(data.message || 'Failed to import questions', { id: toastId });
      }
    } catch (error) {
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
      mode: question.mode || 'exam'
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

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Question Bank</h1>
        <p className={examsSubtitle}>
          {selectedSubject ? `Managing questions for ${selectedSubject.name}` : 'Create and manage questions'}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] font-playfair text-[13px]"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="px-4 py-2 bg-[#8B5CF6] text-white rounded-md hover:bg-[#7C3AED] transition-colors font-playfair text-[13px] leading-[100%] font-[600]"
            >
              📦 Bulk Import
            </button>
            <button
              onClick={() => {
                if (!selectedSubject) {
                  toast.error('Please select a subject from the filter first');
                  return;
                }
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors font-playfair text-[13px] leading-[100%] font-[600]"
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
              const subject = subjects.find(s => s.id === e.target.value);
              setSelectedSubject(subject);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
          >
            <option value="all">All Modes</option>
            {modes.map(mode => (
              <option key={mode} value={mode}>{mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
          >
            <option value="all">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-[#626060] font-playfair">Loading questions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">
                      {question.question}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[9px] leading-[100%] font-[500] ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {question.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[9px] leading-[100%] font-[500] ${
                      question.mode === 'exam' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {question.mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] leading-[100%] font-[500]">
                      {question.marks} mark{question.marks > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mb-2">
                    Subject: {subjects.find(s => s.id === question.subjectId)?.name || 'N/A'} • Class: {question.class} • Topic: {question.topic || 'General'}
                  </p>
                  <div className="space-y-2 mb-3">
                    {question.options?.map((option, idx) => (
                      <div key={idx} className={`p-3 rounded-md text-[13px] leading-[140%] font-[400] ${
                        option === question.correctAnswer ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-50 text-[#1E1E1E]'
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
                    className="p-2 text-[#10b981] hover:bg-[#F0FDF4] rounded-md transition-colors"
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
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-[14px] text-[#626060] font-playfair">No questions found</p>
            </div>
          )}
        </div>
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
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Subject</label>
                    <input
                      type="text"
                      value={selectedSubject?.name || 'No subject selected'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-[13px] font-playfair"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Mode *</label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    >
                      <option value="exam">Exam Mode</option>
                      <option value="practice">Practice Mode</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Question *</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    placeholder="Enter the question text"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Options *</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-6 text-[13px] font-[600] text-[#626060]">{String.fromCharCode(65 + index)}.</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Correct Answer *</label>
                  <input
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    placeholder="Enter the exact correct answer text"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Marks</label>
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Class</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                      placeholder="e.g., SS1, General"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    placeholder="e.g., Mechanics, Algebra"
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
                  className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
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
                <div className={`p-4 rounded-lg mb-4 ${selectedSubject ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <p className="text-[12px] font-playfair">
                    <strong>Subject Selected:</strong> {selectedSubject?.name || 'None'} 
                    {selectedSubject && ` (${selectedSubject.examType})`}
                  </p>
                  {!selectedSubject && (
                    <p className="text-[12px] text-red-600 font-playfair mt-1">
                      Please select a subject from the filter before importing.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={downloadCSVTemplate}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
                  >
                    📥 Download CSV Template
                  </button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair">
                      📤 Upload CSV
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-[11px] text-[#626060] font-playfair mb-2">
                    <strong>CSV Format:</strong> question, optionA, optionB, optionC, optionD, correctAnswer, marks, difficulty (easy/medium/hard), topic, class, mode (exam/practice)
                  </p>
                  <p className="text-[10px] text-[#626060] font-playfair mt-2">
                    Example: "What is the SI unit of force?","Newton","Joule","Watt","Pascal","Newton",2,"easy","Mechanics","General","exam"
                  </p>
                </div>

                {bulkImportFile && (
                  <div className="bg-blue-50 p-2 rounded-md mb-4">
                    <p className="text-[11px] text-blue-700 font-playfair">
                      File uploaded: {bulkImportFile.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Questions Data (JSON Preview)</label>
                  <textarea
                    value={bulkImportData}
                    onChange={(e) => setBulkImportData(e.target.value)}
                    rows="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[12px] font-mono font-playfair"
                    placeholder={JSON.stringify([
                      {
                        question: "What is the SI unit of force?",
                        options: ["Newton", "Joule", "Watt", "Pascal"],
                        correctAnswer: "Newton",
                        marks: 2,
                        difficulty: "easy",
                        topic: "Mechanics",
                        class: "General",
                        mode: "exam"
                      }
                    ], null, 2)}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-[12px] text-blue-700 font-playfair">
                    <strong>Required Fields:</strong> question (string), options (array of 4 strings), correctAnswer (string), marks (number), difficulty (easy/medium/hard), class (string), mode (exam/practice). Topic is optional.
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
                  disabled={!selectedSubject || !bulkImportData.trim()}
                  className={`px-4 py-2 bg-[#8B5CF6] text-white rounded-md hover:bg-[#7C3AED] transition-colors text-[13px] leading-[100%] font-[600] font-playfair ${
                    (!selectedSubject || !bulkImportData.trim()) ? 'opacity-50 cursor-not-allowed' : ''
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
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Mode</label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    >
                      <option value="exam">Exam Mode</option>
                      <option value="practice">Practice Mode</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Class</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Question *</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Options *</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-6 text-[13px] font-[600] text-[#626060]">{String.fromCharCode(65 + index)}.</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Correct Answer *</label>
                  <input
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Marks</label>
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Topic</label>
                    <input
                      type="text"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
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
                  className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
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