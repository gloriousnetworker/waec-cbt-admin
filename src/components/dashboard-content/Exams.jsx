// components/dashboard-content/Exams.jsx
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
  modalButtonDanger,
  superAdminStatCard,
  superAdminStatValue,
  superAdminStatLabel
} from '../styles';

export default function Exams({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    description: '',
    duration: 60,
    totalMarks: 100,
    passMark: 50,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    instructions: '',
    allowRetake: false,
    shuffleQuestions: true,
    showResults: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, subjectsRes, studentsRes] = await Promise.all([
        fetchWithAuth('/admin/exams'),
        fetchWithAuth('/admin/subjects'),
        fetchWithAuth('/admin/students')
      ]);

      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData.exams || []);
      }
      
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || []);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);
      }
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreateExam = async () => {
    if (!formData.title || !formData.subjectId || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime || '23:59'}`);

    const examData = {
      ...formData,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      status: 'draft'
    };

    const toastId = toast.loading('Creating exam...');

    try {
      const response = await fetchWithAuth('/admin/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(examData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Exam created successfully!', { id: toastId });
        setShowCreateModal(false);
        setFormData({
          title: '',
          subjectId: '',
          description: '',
          duration: 60,
          totalMarks: 100,
          passMark: 50,
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          instructions: '',
          allowRetake: false,
          shuffleQuestions: true,
          showResults: true
        });
        fetchData();
      } else {
        toast.error(data.message || 'Failed to create exam', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleActivateExam = async () => {
    if (!selectedExam || selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    const toastId = toast.loading('Activating exam...');

    try {
      const response = await fetchWithAuth(`/admin/exams/${selectedExam.id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
          status: 'active'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Exam activated successfully!', { id: toastId });
        setShowActivateModal(false);
        setShowStudentSelectModal(false);
        setSelectedStudents([]);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to activate exam', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'draft': return 'bg-gray-100 text-gray-600';
      case 'completed': return 'bg-blue-100 text-blue-600';
      case 'expired': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: exams.length,
    active: exams.filter(e => e.status === 'active').length,
    draft: exams.filter(e => e.status === 'draft').length,
    completed: exams.filter(e => e.status === 'completed').length
  };

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Exam Setup</h1>
        <p className={examsSubtitle}>Create and manage examinations for your students</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={superAdminStatCard}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">📝</span>
            <span className={superAdminStatValue}>{stats.total}</span>
          </div>
          <p className={superAdminStatLabel}>Total Exams</p>
        </div>
        <div className={superAdminStatCard}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">🟢</span>
            <span className={superAdminStatValue}>{stats.active}</span>
          </div>
          <p className={superAdminStatLabel}>Active</p>
        </div>
        <div className={superAdminStatCard}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">📄</span>
            <span className={superAdminStatValue}>{stats.draft}</span>
          </div>
          <p className={superAdminStatLabel}>Draft</p>
        </div>
        <div className={superAdminStatCard}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">✅</span>
            <span className={superAdminStatValue}>{stats.completed}</span>
          </div>
          <p className={superAdminStatLabel}>Completed</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search exams by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors font-[600] text-[13px] font-playfair whitespace-nowrap"
            >
              + Create Exam
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-[#626060] font-playfair">Loading exams...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredExams.map((exam) => (
            <motion.div
              key={exam.id}
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => {
                setSelectedExam(exam);
                setShowDetailsModal(true);
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">
                      {exam.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </div>
                  <p className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair mb-1">
                    Subject: {subjects.find(s => s.id === exam.subjectId)?.name || 'N/A'} • Duration: {exam.duration} mins
                  </p>
                  <p className="text-[13px] leading-[140%] font-[400] text-[#1E1E1E] font-playfair line-clamp-2">
                    {exam.description || 'No description provided'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] leading-[100%] font-[400] text-[#9CA3AF] font-playfair">
                    Starts: {formatDate(exam.startDateTime)}
                  </p>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#9CA3AF] font-playfair mt-1">
                    Ends: {formatDate(exam.endDateTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair">
                <span>📊 Total Marks: {exam.totalMarks}</span>
                <span>✅ Pass Mark: {exam.passMark}%</span>
                <span>👥 {exam.assignedStudents || 0} students</span>
                {exam.status === 'draft' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExam(exam);
                      setShowStudentSelectModal(true);
                    }}
                    className="ml-auto px-3 py-1 bg-[#10b981] text-white rounded-md text-[10px] font-[600] hover:bg-[#059669]"
                  >
                    Activate Exam
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {filteredExams.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-[14px] text-[#626060] font-playfair">No exams found</p>
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
              className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Create New Exam</h3>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Exam Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                      placeholder="e.g., Mid-Term Examination"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Subject *</label>
                    <select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    placeholder="Brief description of the exam"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Duration (mins)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Total Marks</label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Pass Mark (%)</label>
                    <input
                      type="number"
                      name="passMark"
                      value={formData.passMark}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                    placeholder="Instructions for students..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="allowRetake"
                      checked={formData.allowRetake}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#10b981]"
                    />
                    <span className="text-[13px] text-[#1E1E1E] font-playfair">Allow retake</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={formData.shuffleQuestions}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#10b981]"
                    />
                    <span className="text-[13px] text-[#1E1E1E] font-playfair">Shuffle questions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="showResults"
                      checked={formData.showResults}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#10b981]"
                    />
                    <span className="text-[13px] text-[#1E1E1E] font-playfair">Show results immediately</span>
                  </label>
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
                  onClick={handleCreateExam}
                  className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
                >
                  Create Exam
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDetailsModal && selectedExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedExam(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[20px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair">
                      {selectedExam.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] ${getStatusColor(selectedExam.status)}`}>
                      {selectedExam.status}
                    </span>
                  </div>
                  <p className="text-[13px] leading-[100%] font-[400] text-[#626060] font-playfair">
                    Subject: {subjects.find(s => s.id === selectedExam.subjectId)?.name || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedExam(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Duration</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">{selectedExam.duration} minutes</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Total Marks</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">{selectedExam.totalMarks}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Pass Mark</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">{selectedExam.passMark}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mb-1 font-playfair">Assigned Students</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">{selectedExam.assignedStudents || 0}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">Schedule</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair">
                    <span className="font-[600]">Starts:</span> {formatDate(selectedExam.startDateTime)}
                  </p>
                  <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair mt-1">
                    <span className="font-[600]">Ends:</span> {formatDate(selectedExam.endDateTime)}
                  </p>
                </div>
              </div>

              {selectedExam.description && (
                <div className="mb-6">
                  <h4 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">Description</h4>
                  <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair bg-gray-50 p-4 rounded-lg">
                    {selectedExam.description}
                  </p>
                </div>
              )}

              {selectedExam.instructions && (
                <div className="mb-6">
                  <h4 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">Instructions</h4>
                  <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair bg-gray-50 p-4 rounded-lg">
                    {selectedExam.instructions}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedExam(null);
                  }}
                  className={modalButtonSecondary}
                >
                  Close
                </button>
                {selectedExam.status === 'draft' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowStudentSelectModal(true);
                    }}
                    className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
                  >
                    Activate Exam
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showStudentSelectModal && selectedExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowStudentSelectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Select Students for {selectedExam.title}</h3>
              
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={handleSelectAllStudents}
                  className="text-[12px] text-[#10b981] font-[600] hover:underline"
                >
                  {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
                <p className="text-[12px] text-[#626060]">
                  {selectedStudents.length} students selected
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                {students.map(student => (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleToggleStudent(student.id)}
                      className="w-4 h-4 text-[#10b981]"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-[11px] leading-[100%] font-[400] text-[#626060] mt-1 font-playfair">
                        Class: {student.class} • Login ID: {student.loginId}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className={modalActions}>
                <button
                  onClick={() => setShowStudentSelectModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowStudentSelectModal(false);
                    setShowActivateModal(true);
                  }}
                  disabled={selectedStudents.length === 0}
                  className={`px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair ${
                    selectedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Continue to Activate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showActivateModal && selectedExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowActivateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={modalContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Activate Exam</h3>
              <p className={modalText}>
                Are you sure you want to activate this exam for {selectedStudents.length} student(s)? 
                Once activated, students will be able to access the exam during the scheduled time.
              </p>
              <div className={modalActions}>
                <button
                  onClick={() => setShowActivateModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivateExam}
                  className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
                >
                  Confirm Activation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}