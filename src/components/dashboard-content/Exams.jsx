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
  modalButtonDanger
} from '../../styles/styles';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' } }),
};

export default function Exams({ setActiveSection }) {
  const { user, fetchWithAuth } = useAuth();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examsPage, setExamsPage] = useState(1);
  const [examsTotalCount, setExamsTotalCount] = useState(0);
  const EXAMS_LIMIT = 50;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examResults, setExamResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAllInClass, setSelectAllInClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    subjects: [{ subjectId: '', questionCount: 10 }],
    duration: 120,
    passMark: 50,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    instructions: '',
    allowRetake: false,
    shuffleQuestions: true,
    showResults: true,
    questionSelection: 'random'
  });
  // Removed totalMarks from formData since backend calculates it

  const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, subjectsRes, studentsRes, questionsRes] = await Promise.all([
        fetchWithAuth(`/admin/exam-setups?limit=${EXAMS_LIMIT}&page=${examsPage}`),
        fetchWithAuth('/admin/subjects'),
        fetchWithAuth('/admin/students'),
        fetchWithAuth('/admin/questions')
      ]);

      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData.exams || []);
        setExamsTotalCount(examsData.total || (examsData.exams || []).length);
      }
      
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || []);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setQuestions(questionsData.questions || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get question count for a subject (filtered by exam mode)
  const getQuestionCountForSubject = (subjectId, mode = 'exam') => {
    return questions.filter(q => q.subjectId === subjectId && q.mode === mode).length;
  };

  // Helper function to get total available marks for a subject
  const getTotalMarksForSubject = (subjectId, questionCount, mode = 'exam') => {
    const subjectQuestions = questions.filter(q => q.subjectId === subjectId && q.mode === mode);
    // If we're selecting a specific number of questions, estimate marks based on average
    if (questionCount && subjectQuestions.length > 0) {
      const totalMarks = subjectQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
      const averageMarks = totalMarks / subjectQuestions.length;
      return Math.round(averageMarks * questionCount);
    }
    return 0;
  };

  const fetchExamResults = async (examId) => {
    try {
      const response = await fetchWithAuth(`/admin/exam-setups/${examId}/results`);
      if (response.ok) {
        const data = await response.json();
        setExamResults(data);
        setShowResultsModal(true);
      } else {
        toast.error('Failed to load exam results');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'class') {
      setSelectedClass(value);
    }
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index][field] = value;
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { subjectId: '', questionCount: 10 }]
    });
  };

  const removeSubject = (index) => {
    if (formData.subjects.length > 1) {
      const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData({ ...formData, subjects: updatedSubjects });
    }
  };

  const validateExamForm = () => {
    if (!formData.title || !formData.class || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.subjects.length === 0) {
      toast.error('Please add at least one subject');
      return false;
    }

    for (const subject of formData.subjects) {
      if (!subject.subjectId) {
        toast.error('Please select a subject for all entries');
        return false;
      }
      
      const availableQuestions = getQuestionCountForSubject(subject.subjectId);
      if (availableQuestions === 0) {
        toast.error(`No questions available for the selected subject. Please create questions first.`);
        return false;
      }
      
      if (subject.questionCount > availableQuestions) {
        toast.error(`Subject only has ${availableQuestions} questions available`);
        return false;
      }

      if (subject.questionCount < 1) {
        toast.error('Question count must be at least 1');
        return false;
      }
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return false;
    }

    return true;
  };

  const handleCreateExam = async () => {
    if (!validateExamForm()) return;

    // Remove totalMarks from the data being sent
    const { totalMarks, ...examDataToSend } = formData;
    
    const examData = {
      ...examDataToSend,
      startDateTime: new Date(`${formData.startDate}T${formData.startTime || '00:00'}`).toISOString(),
      endDateTime: new Date(`${formData.endDate}T${formData.endTime || '23:59'}`).toISOString(),
    };

    const toastId = toast.loading('Creating exam...');

    try {
      const response = await fetchWithAuth('/admin/exam-setups', {
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
          description: '',
          class: '',
          subjects: [{ subjectId: '', questionCount: 10 }],
          duration: 120,
          passMark: 50,
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          instructions: '',
          allowRetake: false,
          shuffleQuestions: true,
          showResults: true,
          questionSelection: 'random'
        });
        fetchData();
      } else {
        toast.error(data.message || 'Failed to create exam', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleUpdateExam = async () => {
    if (!selectedExam) return;

    const updateData = {};
    if (formData.title !== selectedExam.title) updateData.title = formData.title;
    if (formData.duration !== selectedExam.duration) updateData.duration = formData.duration;
    if (formData.passMark !== selectedExam.passMark) updateData.passMark = formData.passMark;
    if (formData.instructions !== selectedExam.instructions) updateData.instructions = formData.instructions;

    if (Object.keys(updateData).length === 0) {
      setShowEditModal(false);
      return;
    }

    const toastId = toast.loading('Updating exam...');

    try {
      const response = await fetchWithAuth(`/admin/exam-setups/${selectedExam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Exam updated successfully!', { id: toastId });
        setShowEditModal(false);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update exam', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleAssignStudents = async () => {
    if (!selectedExam || selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    const toastId = toast.loading('Assigning students...');

    try {
      const response = await fetchWithAuth(`/admin/exam-setups/${selectedExam.id}/assign-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentIds: selectedStudents })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Assigned to ${selectedStudents.length} students successfully!`, { id: toastId });
        setShowStudentSelectModal(false);
        setSelectedStudents([]);
        setSelectAllInClass(false);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to assign students', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleActivateExam = async () => {
    if (!selectedExam) return;

    const toastId = toast.loading('Activating exam...');

    try {
      const response = await fetchWithAuth(`/admin/exam-setups/${selectedExam.id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedStudents.length > 0 ? { studentIds: selectedStudents } : {})
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

  const handleDeactivateExam = async () => {
    if (!selectedExam) return;

    const toastId = toast.loading('Deactivating exam...');

    try {
      const response = await fetchWithAuth(`/admin/exam-setups/${selectedExam.id}/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Exam deactivated successfully!', { id: toastId });
        setShowDeactivateModal(false);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to deactivate exam', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;

    const toastId = toast.loading('Deleting exam...');

    try {
      const response = await fetchWithAuth(`/admin/exam-setups/${selectedExam.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Exam deleted successfully!', { id: toastId });
        setShowDeleteModal(false);
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete exam', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleSelectAllInClass = () => {
    if (selectAllInClass) {
      setSelectedStudents([]);
    } else {
      const classStudents = students
        .filter(s => s.class === selectedExam?.class)
        .map(s => s.id);
      setSelectedStudents(classStudents);
    }
    setSelectAllInClass(!selectAllInClass);
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
    setSelectAllInClass(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const formatDateOnly = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-success-light text-success';
      case 'draft': return 'bg-surface-subtle text-content-secondary';
      case 'completed': return 'bg-blue-100 text-blue-600';
      default: return 'bg-surface-subtle text-content-secondary';
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    const matchesClass = filterClass === 'all' || exam.class === filterClass;
    return matchesSearch && matchesStatus && matchesClass;
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
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">📝</span>
            <span className="text-[24px] leading-[100%] font-[700] text-content-primary">{stats.total}</span>
          </div>
          <p className="text-[12px] leading-[100%] font-[400] text-content-muted">Total Exams</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">🟢</span>
            <span className="text-[24px] leading-[100%] font-[700] text-content-primary">{stats.active}</span>
          </div>
          <p className="text-[12px] leading-[100%] font-[400] text-content-muted">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">📄</span>
            <span className="text-[24px] leading-[100%] font-[700] text-content-primary">{stats.draft}</span>
          </div>
          <p className="text-[12px] leading-[100%] font-[400] text-content-muted">Draft</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">✅</span>
            <span className="text-[24px] leading-[100%] font-[700] text-content-primary">{stats.completed}</span>
          </div>
          <p className="text-[12px] leading-[100%] font-[400] text-content-muted">Completed</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search exams by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-colors font-[600] text-[13px] whitespace-nowrap"
            >
              + Create Exam
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-content-muted">Loading exams...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredExams.map((exam, i) => (
            <motion.div
              key={exam.id}
              whileHover={{ y: -2 }}
              custom={i} variants={cardVariants} initial="hidden" animate="visible"
              className="bg-white rounded-xl border border-border p-6 cursor-pointer hover:shadow-card-md transition-all"
              onClick={() => {
                setSelectedExam(exam);
                setShowDetailsModal(true);
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-[16px] leading-[120%] font-[600] text-content-primary">
                      {exam.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] leading-[100%] font-[500]">
                      {exam.class}
                    </span>
                  </div>
                  <p className="text-[12px] leading-[100%] font-[400] text-content-muted mb-1">
                    {exam.subjects?.length || 0} subject(s) • {exam.subjects?.reduce((sum, s) => sum + (s.questionCount || 0), 0)} questions
                  </p>
                  <p className="text-[13px] leading-[140%] font-[400] text-content-primary line-clamp-2">
                    {exam.description || 'No description provided'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] leading-[100%] font-[400] text-content-muted">
                    Starts: {formatDateOnly(exam.startDateTime)}
                  </p>
                  <p className="text-[11px] leading-[100%] font-[400] text-content-muted mt-1">
                    Ends: {formatDateOnly(exam.endDateTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] leading-[100%] font-[400] text-content-muted">
                <span>📊 Total Marks: {exam.totalMarks}</span>
                <span>✅ Pass Mark: {exam.passMark}%</span>
                <span>👥 {exam.assignedStudents?.length || 0} students</span>
                {exam.status === 'active' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchExamResults(exam.id);
                    }}
                    className="ml-auto px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-[10px] font-[600] hover:bg-blue-200"
                  >
                    View Results
                  </button>
                )}
                {exam.status === 'draft' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExam(exam);
                      setFormData({
                        title: exam.title,
                        description: exam.description || '',
                        class: exam.class,
                        subjects: exam.subjects.map(s => ({
                          subjectId: s.subjectId,
                          questionCount: s.questionCount
                        })),
                        duration: exam.duration,
                        passMark: exam.passMark,
                        startDate: '',
                        startTime: '',
                        endDate: '',
                        endTime: '',
                        instructions: exam.instructions || '',
                        allowRetake: exam.allowRetake || false,
                        shuffleQuestions: exam.shuffleQuestions !== false,
                        showResults: exam.showResults !== false,
                        questionSelection: exam.questionSelection || 'random'
                      });
                      setShowEditModal(true);
                    }}
                    className="ml-2 px-3 py-1 bg-warning-light text-warning-dark rounded-md text-[10px] font-[600] hover:bg-yellow-200"
                  >
                    Edit
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {filteredExams.length === 0 && (
            <div className="bg-white rounded-xl border border-border p-12 text-center">
              <p className="text-[14px] text-content-muted">No exams found</p>
            </div>
          )}
        </div>
      )}

      {examsTotalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-border gap-3">
          <p className="text-sm text-content-muted">
            Page {examsPage} of {Math.ceil(examsTotalCount / EXAMS_LIMIT)} · {examsTotalCount} total exams
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setExamsPage(p => Math.max(1, p - 1))}
              disabled={examsPage === 1}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Previous
            </button>
            <button
              onClick={() => setExamsPage(p => Math.min(Math.ceil(examsTotalCount / EXAMS_LIMIT), p + 1))}
              disabled={examsPage >= Math.ceil(examsTotalCount / EXAMS_LIMIT)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Next
            </button>
          </div>
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
              className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Create New Exam</h3>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Exam Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                      placeholder="e.g., First Term Examination"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Class *</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    placeholder="Brief description of the exam"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[12px] leading-[100%] font-[500] text-content-primary">Subjects *</label>
                    <button
                      type="button"
                      onClick={addSubject}
                      className="text-[11px] text-brand-primary font-[600] hover:underline"
                    >
                      + Add Subject
                    </button>
                  </div>
                  {formData.subjects.map((subject, index) => {
                    const availableQuestions = getQuestionCountForSubject(subject.subjectId);
                    const estimatedMarks = getTotalMarksForSubject(subject.subjectId, subject.questionCount);
                    return (
                      <div key={index} className="flex gap-3 mb-3">
                        <select
                          value={subject.subjectId}
                          onChange={(e) => handleSubjectChange(index, 'subjectId', e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(s => {
                            const count = getQuestionCountForSubject(s.id);
                            return (
                              <option key={s.id} value={s.id} disabled={count === 0}>
                                {s.name} ({count} questions available)
                              </option>
                            );
                          })}
                        </select>
                        <input
                          type="number"
                          value={subject.questionCount}
                          onChange={(e) => {
                            const raw = parseInt(e.target.value, 10);
                            if (isNaN(raw)) { handleSubjectChange(index, 'questionCount', ''); return; }
                            handleSubjectChange(index, 'questionCount', Math.min(Math.max(1, raw), availableQuestions || 100));
                          }}
                          min="1"
                          max={availableQuestions || 100}
                          className="w-24 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                          placeholder="Count"
                        />
                        {formData.subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubject(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            ✕
                          </button>
                        )}
                        {subject.subjectId && (
                          <span className="text-[11px] text-content-muted self-center whitespace-nowrap">
                            ~{estimatedMarks} marks
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {formData.subjects.some(s => s.subjectId && s.questionCount > getQuestionCountForSubject(s.subjectId)) && (
                    <p className="text-[11px] text-red-600 mt-1">
                      ⚠️ Some subjects have more questions selected than available
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Duration (mins) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="15"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Pass Mark (%) *</label>
                    <input
                      type="number"
                      name="passMark"
                      value={formData.passMark}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    placeholder="Instructions for students..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={formData.shuffleQuestions}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary"
                    />
                    <span className="text-[13px] text-content-primary">Shuffle questions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="showResults"
                      checked={formData.showResults}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary"
                    />
                    <span className="text-[13px] text-content-primary">Show results immediately</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="allowRetake"
                      checked={formData.allowRetake}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary"
                    />
                    <span className="text-[13px] text-content-primary">Allow retake</span>
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
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-[13px] leading-[100%] font-[600]"
                >
                  Create Exam
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showEditModal && selectedExam && (
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
              className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Edit Exam</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Exam Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Duration (mins)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Pass Mark (%)</label>
                    <input
                      type="number"
                      name="passMark"
                      value={formData.passMark}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-content-primary">Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-[13px]"
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
                  onClick={handleUpdateExam}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-[13px] leading-[100%] font-[600]"
                >
                  Update Exam
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
                    <h3 className="text-[20px] leading-[120%] font-[700] text-content-primary">
                      {selectedExam.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] ${getStatusColor(selectedExam.status)}`}>
                      {selectedExam.status}
                    </span>
                  </div>
                  <p className="text-[13px] leading-[100%] font-[400] text-content-muted">
                    Class: {selectedExam.class}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedExam(null);
                  }}
                  className="text-content-muted hover:text-content-secondary text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-surface-muted rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-content-muted mb-1">Duration</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-content-primary">{selectedExam.duration} minutes</p>
                </div>
                <div className="p-4 bg-surface-muted rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-content-muted mb-1">Total Marks</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-content-primary">{selectedExam.totalMarks}</p>
                </div>
                <div className="p-4 bg-surface-muted rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-content-muted mb-1">Pass Mark</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-content-primary">{selectedExam.passMark}%</p>
                </div>
                <div className="p-4 bg-surface-muted rounded-lg">
                  <p className="text-[11px] leading-[100%] font-[400] text-content-muted mb-1">Assigned Students</p>
                  <p className="text-[16px] leading-[120%] font-[600] text-content-primary">{selectedExam.assignedStudents?.length || 0}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[14px] leading-[100%] font-[600] text-content-primary mb-2">Subjects</h4>
                <div className="space-y-2">
                  {selectedExam.subjects?.map((subject, index) => (
                    <div key={index} className="p-3 bg-surface-muted rounded-lg flex justify-between items-center">
                      <span className="text-[13px] font-[600] text-content-primary">{subject.subjectName}</span>
                      <span className="text-[12px] text-content-muted">
                        {subject.questionCount} questions • {subject.totalMarks} marks
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[14px] leading-[100%] font-[600] text-content-primary mb-2">Schedule</h4>
                <div className="p-4 bg-surface-muted rounded-lg">
                  <p className="text-[12px] leading-[140%] font-[400] text-content-muted">
                    <span className="font-[600]">Starts:</span> {formatDate(selectedExam.startDateTime)}
                  </p>
                  <p className="text-[12px] leading-[140%] font-[400] text-content-muted mt-1">
                    <span className="font-[600]">Ends:</span> {formatDate(selectedExam.endDateTime)}
                  </p>
                </div>
              </div>

              {selectedExam.description && (
                <div className="mb-6">
                  <h4 className="text-[14px] leading-[100%] font-[600] text-content-primary mb-2">Description</h4>
                  <p className="text-[12px] leading-[140%] font-[400] text-content-muted bg-surface-muted p-4 rounded-lg">
                    {selectedExam.description}
                  </p>
                </div>
              )}

              {selectedExam.instructions && (
                <div className="mb-6">
                  <h4 className="text-[14px] leading-[100%] font-[600] text-content-primary mb-2">Instructions</h4>
                  <p className="text-[12px] leading-[140%] font-[400] text-content-muted bg-surface-muted p-4 rounded-lg">
                    {selectedExam.instructions}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border flex-wrap">
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
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowStudentSelectModal(true);
                      }}
                      className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-[13px] leading-[100%] font-[600]"
                    >
                      Assign Students
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedStudents([]);
                        setShowActivateModal(true);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-[13px] leading-[100%] font-[600]"
                    >
                      Activate for All
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-[13px] leading-[100%] font-[600]"
                    >
                      Delete
                    </button>
                  </>
                )}
                
                {selectedExam.status === 'active' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        fetchExamResults(selectedExam.id);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[13px] leading-[100%] font-[600]"
                    >
                      View Results
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowDeactivateModal(true);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-[13px] leading-[100%] font-[600]"
                    >
                      Deactivate
                    </button>
                  </>
                )}
                
                {selectedExam.status === 'completed' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      fetchExamResults(selectedExam.id);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[13px] leading-[100%] font-[600]"
                  >
                    View Results
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
              <h3 className={modalTitle}>Assign Students to {selectedExam.title}</h3>
              
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={handleSelectAllInClass}
                  className="text-[12px] text-brand-primary font-[600] hover:underline"
                >
                  {selectAllInClass ? 'Deselect All in Class' : 'Select All in Class'}
                </button>
                <p className="text-[12px] text-content-muted">
                  {selectedStudents.length} students selected
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                {students
                  .filter(s => s.class === selectedExam.class)
                  .map(student => (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 p-3 hover:bg-surface-muted rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleToggleStudent(student.id)}
                      className="w-4 h-4 text-brand-primary"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] leading-[100%] font-[600] text-content-primary">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-[11px] leading-[100%] font-[400] text-content-muted mt-1">
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
                  onClick={handleAssignStudents}
                  disabled={selectedStudents.length === 0}
                  className={`px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-[13px] leading-[100%] font-[600] ${
                    selectedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Assign Students
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
                {selectedStudents.length > 0 
                  ? `Are you sure you want to activate this exam for ${selectedStudents.length} selected student(s)?`
                  : 'Are you sure you want to activate this exam for all students in this class?'}
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
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-[13px] leading-[100%] font-[600]"
                >
                  Confirm Activation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeactivateModal && selectedExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowDeactivateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={modalContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Deactivate Exam</h3>
              <p className={modalText}>
                Are you sure you want to deactivate this exam? Students will no longer be able to access it.
              </p>
              <div className={modalActions}>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivateExam}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-[13px] leading-[100%] font-[600]"
                >
                  Confirm Deactivation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteModal && selectedExam && (
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
              <h3 className={modalTitle}>Delete Exam</h3>
              <p className={modalText}>
                Are you sure you want to delete this exam? This action cannot be undone.
              </p>
              <div className={modalActions}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExam}
                  className={modalButtonDanger}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResultsModal && examResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => {
              setShowResultsModal(false);
              setExamResults(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className={modalTitle}>{examResults.exam.title} - Results</h3>
                <button
                  onClick={() => {
                    setShowResultsModal(false);
                    setExamResults(null);
                  }}
                  className="text-content-muted hover:text-content-secondary text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface-muted p-4 rounded-lg">
                  <p className="text-[11px] text-content-muted mb-1">Total Students</p>
                  <p className="text-[20px] font-[700] text-content-primary">{examResults.summary.totalStudents}</p>
                </div>
                <div className="bg-surface-muted p-4 rounded-lg">
                  <p className="text-[11px] text-content-muted mb-1">Submitted</p>
                  <p className="text-[20px] font-[700] text-content-primary">{examResults.summary.submittedCount}</p>
                </div>
                <div className="bg-surface-muted p-4 rounded-lg">
                  <p className="text-[11px] text-content-muted mb-1">Average Score</p>
                  <p className="text-[20px] font-[700] text-content-primary">{Math.round(examResults.summary.averageScore)}%</p>
                </div>
                <div className="bg-surface-muted p-4 rounded-lg">
                  <p className="text-[11px] text-content-muted mb-1">Pass Rate</p>
                  <p className="text-[20px] font-[700] text-brand-primary">{Math.round(examResults.summary.passRate)}%</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-[600] text-content-muted">Student</th>
                      <th className="px-4 py-3 text-left text-[11px] font-[600] text-content-muted">Class</th>
                      <th className="px-4 py-3 text-left text-[11px] font-[600] text-content-muted">Score</th>
                      <th className="px-4 py-3 text-left text-[11px] font-[600] text-content-muted">Percentage</th>
                      <th className="px-4 py-3 text-left text-[11px] font-[600] text-content-muted">Correct</th>
                      <th className="px-4 py-3 text-left text-[11px] font-[600] text-content-muted">Wrong</th>
                      <th className="px-4 py-3 text-left text-[11px] font-[600] text-content-muted">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examResults.results.map((result, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-[500] text-content-primary">{result.studentName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-content-muted">{result.studentClass}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-[500]">{result.score}/{result.totalMarks}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-[600] ${
                            result.percentage >= 75 ? 'bg-success-light text-success' :
                            result.percentage >= 60 ? 'bg-blue-100 text-blue-600' :
                            result.percentage >= 50 ? 'bg-warning-light text-warning-dark' :
                            'bg-danger-light text-danger'
                          }`}>
                            {Math.round(result.percentage)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-green-600">{result.correctAnswers || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-red-600">{result.wrongAnswers || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-content-muted">
                            {result.submittedAt ? new Date(result.submittedAt._seconds * 1000).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={modalActions}>
                <button
                  onClick={() => {
                    setShowResultsModal(false);
                    setExamResults(null);
                  }}
                  className={modalButtonSecondary}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}