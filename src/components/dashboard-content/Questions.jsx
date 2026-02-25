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
  const [filterClass, setFilterClass] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [bulkImportData, setBulkImportData] = useState('');
  const [formData, setFormData] = useState({
    subjectId: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1,
    explanation: '',
    difficulty: 'medium',
    topic: '',
    class: '',
    examType: 'WAEC'
  });

  const difficulties = ['easy', 'medium', 'hard'];
  const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  const examTypes = ['WAEC', 'NECO', 'JAMB', 'GCE', 'Internal'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsRes, subjectsRes] = await Promise.all([
        fetchWithAuth('/admin/questions'),
        fetchWithAuth('/admin/subjects')
      ]);

      const questionsData = await questionsRes.json();
      const subjectsData = await subjectsRes.json();

      setQuestions(questionsData.questions || []);
      setSubjects(subjectsData.subjects || []);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      setFormData(prev => ({
        ...prev,
        subjectId: selectedSubject.id,
        class: selectedSubject.class,
        examType: selectedSubject.examType
      }));
    }
  }, [selectedSubject]);

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
    if (!formData.subjectId || !formData.question || formData.options.some(opt => !opt)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const toastId = toast.loading('Creating question...');

    try {
      const response = await fetchWithAuth('/admin/questions', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Question created successfully!', { id: toastId });
        setShowCreateModal(false);
        setFormData({
          subjectId: '',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: 1,
          explanation: '',
          difficulty: 'medium',
          topic: '',
          class: '',
          examType: 'WAEC'
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
    if (!formData.question || formData.options.some(opt => !opt)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const toastId = toast.loading('Updating question...');

    try {
      const response = await fetchWithAuth(`/admin/questions/${selectedQuestion.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Question updated successfully!', { id: toastId });
        setShowEditModal(false);
        setSelectedQuestion(null);
        setFormData({
          subjectId: '',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: 1,
          explanation: '',
          difficulty: 'medium',
          topic: '',
          class: '',
          examType: 'WAEC'
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
    if (!selectedSubject || !bulkImportData.trim()) {
      toast.error('Please select a subject and provide questions data');
      return;
    }

    try {
      const questions = JSON.parse(bulkImportData);
      
      const toastId = toast.loading('Importing questions...');

      const response = await fetchWithAuth('/admin/questions/bulk-import', {
        method: 'POST',
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
        fetchData();
      } else {
        toast.error(data.message || 'Failed to import questions', { id: toastId });
      }
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const openEditModal = (question) => {
    setSelectedQuestion(question);
    setFormData({
      subjectId: question.subjectId || '',
      question: question.question || '',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || 0,
      marks: question.marks || 1,
      explanation: question.explanation || '',
      difficulty: question.difficulty || 'medium',
      topic: question.topic || '',
      class: question.class || '',
      examType: question.examType || 'WAEC'
    });
    setShowEditModal(true);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || q.subjectId === filterSubject;
    const matchesClass = filterClass === 'all' || q.class === filterClass;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesSubject && matchesClass && matchesDifficulty;
  });

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Question Bank</h1>
        <p className={examsSubtitle}>Create and manage questions for your subjects</p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] font-playfair text-[13px]"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="px-4 py-2 bg-[#10B981] text-white rounded-md hover:bg-[#059669] transition-colors font-playfair text-[13px] leading-[100%] font-[600]"
            >
              📦 Bulk Import
            </button>
            <button
              onClick={() => {
                setSelectedSubject(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors font-playfair text-[13px] leading-[100%] font-[600]"
            >
              + Add Question
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
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
          <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                  <div className="flex items-center gap-3 mb-2">
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
                  </div>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mb-2">
                    Subject: {subjects.find(s => s.id === question.subjectId)?.name || 'N/A'} • Class: {question.class} • Topic: {question.topic || 'General'}
                  </p>
                  <div className="space-y-2 mb-3">
                    {question.options?.map((option, idx) => (
                      <div key={idx} className={`p-3 rounded-md text-[13px] leading-[140%] font-[400] ${
                        idx === question.correctAnswer ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-50 text-[#1E1E1E]'
                      }`}>
                        {String.fromCharCode(65 + idx)}. {option}
                        {idx === question.correctAnswer && ' ✓'}
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
                    className="p-2 text-[#2563EB] hover:bg-[#EFF6FF] rounded-md transition-colors"
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
      )}

      <AnimatePresence>
        {showCreateModal && (
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
              className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className={modalTitle}>Create New Question</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Subject *</label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name} ({subject.class})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Question *</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => setFormData({ ...formData, correctAnswer: index })}
                        className="w-4 h-4 text-[#2563EB]"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Marks</label>
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    placeholder="e.g., Algebra, Trigonometry"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Explanation (Optional)</label>
                  <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    placeholder="Explain why the correct answer is right"
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
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
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
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4"
            >
              <h3 className={modalTitle}>Bulk Import Questions</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Select Subject</label>
                  <select
                    value={selectedSubject?.id || ''}
                    onChange={(e) => {
                      const subject = subjects.find(s => s.id === e.target.value);
                      setSelectedSubject(subject);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                  >
                    <option value="">Choose a subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name} ({subject.class})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Questions Data (JSON Array)</label>
                  <textarea
                    value={bulkImportData}
                    onChange={(e) => setBulkImportData(e.target.value)}
                    rows="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-mono font-playfair"
                    placeholder={JSON.stringify([
                      {
                        question: "What is 2+2?",
                        options: ["3", "4", "5", "6"],
                        correctAnswer: 1,
                        marks: 1,
                        difficulty: "easy",
                        topic: "Addition"
                      }
                    ], null, 2)}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-[12px] text-blue-700 font-playfair">
                    <strong>Format Example:</strong> Each question object should have: question (string), options (array of 4 strings), correctAnswer (index 0-3), marks (number), difficulty (easy/medium/hard), topic (string, optional).
                  </p>
                </div>
              </div>

              <div className={modalActions}>
                <button
                  onClick={() => {
                    setShowBulkImportModal(false);
                    setBulkImportData('');
                    setSelectedSubject(null);
                  }}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-4 py-2 bg-[#10B981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
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
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className={modalTitle}>Edit Question</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Question *</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => setFormData({ ...formData, correctAnswer: index })}
                        className="w-4 h-4 text-[#2563EB]"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Marks</label>
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Explanation</label>
                  <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
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
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
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
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={modalContainer}
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