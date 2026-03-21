// components/dashboard-content/Students.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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

export default function Students({ setActiveSection }) {
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingSubject, setAddingSubject] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 50;

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      const response = await fetchWithAuth(`/admin/students?limit=${LIMIT}&page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setTotalCount(data.total || (data.students || []).length);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetchWithAuth('/admin/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleDeleteStudent = async () => {
    const toastId = toast.loading('Deleting student...');
    try {
      const response = await fetchWithAuth(`/admin/students/${selectedStudent.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Student deleted successfully!', { id: toastId });
        setStudents(students.filter(s => s.id !== selectedStudent.id));
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete student', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    } finally {
      setShowDeleteModal(false);
      setSelectedStudent(null);
    }
  };

  const handleAddSubject = async () => {
    if (!selectedSubject || !selectedStudent) return;
    
    setAddingSubject(true);
    const toastId = toast.loading('Adding subject...');
    
    try {
      const response = await fetchWithAuth(`/admin/students/${selectedStudent.id}/subjects`, {
        method: 'POST',
        body: JSON.stringify({ subjectId: selectedSubject })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Subject added successfully!', { id: toastId });
        const updatedStudents = students.map(s => 
          s.id === selectedStudent.id ? { ...s, subjects: data.subjects } : s
        );
        setStudents(updatedStudents);
        setShowAddSubjectModal(false);
        setSelectedSubject('');
      } else {
        toast.error(data.message || 'Failed to add subject', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    } finally {
      setAddingSubject(false);
    }
  };

  const handleRemoveSubject = async (student, subjectName) => {
    const toastId = toast.loading('Removing subject...');
    
    try {
      const response = await fetchWithAuth(`/admin/students/${student.id}/subjects`, {
        method: 'DELETE',
        body: JSON.stringify({ subject: subjectName })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Subject removed successfully!', { id: toastId });
        const updatedStudents = students.map(s => 
          s.id === student.id ? { ...s, subjects: data.subjects } : s
        );
        setStudents(updatedStudents);
      } else {
        toast.error(data.message || 'Failed to remove subject', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleViewStudent = async (student) => {
    try {
      const response = await fetchWithAuth(`/admin/students/${student.id}`);
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('selected_student', JSON.stringify(data.student));
        localStorage.setItem('student_performance', JSON.stringify(data.performance));
        localStorage.setItem('student_exams', JSON.stringify(data.exams));
        setActiveSection('performance');
      } else {
        toast.error('Failed to fetch student details');
      }
    } catch (error) {
      toast.error('Failed to fetch student details');
    }
  };

  const handleEditStudent = (student) => {
    localStorage.setItem('edit_student', JSON.stringify(student));
    router.push('/dashboard/student-registration?edit=true');
  };

  const handleToggleExamMode = async (student) => {
    const newMode = !student.examMode;
    const toastId = toast.loading(`${newMode ? 'Enabling' : 'Disabling'} exam mode...`);

    try {
      const response = await fetchWithAuth(`/admin/students/${student.id}/exam-mode`, {
        method: 'PATCH',
        body: JSON.stringify({ examMode: newMode })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Exam mode ${newMode ? 'enabled' : 'disabled'} successfully!`, { id: toastId });
        setStudents(students.map(s => 
          s.id === student.id ? { ...s, examMode: data.student.examMode } : s
        ));
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to toggle exam mode', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.loginId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.nin || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (student) => {
    if (!student || !student.firstName || !student.lastName) return 'ST';
    return `${student.firstName[0] || ''}${student.lastName[0] || ''}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const availableSubjects = subjects.filter(s => 
    !selectedStudent?.subjects?.includes(s.name)
  );

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Student Management</h1>
        <p className={examsSubtitle}>Register, manage and monitor your students</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search students by name, email, login ID or NIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm text-content-primary placeholder-content-muted bg-white transition-all min-h-[44px]"
          />
        </div>
        <button
          onClick={() => router.push('/dashboard/student-registration')}
          className="px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-colors text-sm font-semibold min-h-[44px] whitespace-nowrap flex-shrink-0"
        >
          + Add New Student
        </button>
      </div>

      {/* ── Unified card list — all screen sizes ─────────────── */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-border shadow-card p-12 text-center">
          <p className="text-2xl mb-3">👥</p>
          <p className="text-sm text-content-muted">No students found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl border border-border shadow-card p-4 hover:border-brand-primary transition-colors">
              <div className="flex items-start gap-3">

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
                >
                  {getInitials(student)}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  {/* Name + badges row */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-content-primary">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      student.status === 'active' ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'
                    }`}>{student.status}</span>
                    <button
                      onClick={() => handleToggleExamMode(student)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                        student.examMode ? 'bg-success-light text-success-dark' : 'bg-surface-subtle text-content-muted'
                      }`}
                    >Exam: {student.examMode ? 'On' : 'Off'}</button>
                  </div>

                  {/* Meta line */}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-content-muted mb-2">
                    <span className="truncate max-w-[180px]">{student.email}</span>
                    <span>ID: <span className="font-medium text-content-secondary">{student.loginId}</span></span>
                    {student.nin && <span>NIN: <span className="font-medium text-content-secondary">{student.nin}</span></span>}
                    <span>Class: <span className="font-medium text-content-secondary">{student.class}</span></span>
                    <span>Joined: <span className="font-medium text-content-secondary">{formatDate(student.createdAt)}</span></span>
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-1">
                    {student.subjects?.slice(0, 5).map(subject => (
                      <div key={subject} className="flex items-center gap-0.5 bg-brand-primary-lt text-brand-primary px-2 py-0.5 rounded-full text-[10px] font-medium">
                        {subject}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveSubject(student, subject); }}
                          className="hover:text-danger ml-0.5 leading-none"
                          aria-label={`Remove ${subject}`}
                        >×</button>
                      </div>
                    ))}
                    {(student.subjects?.length || 0) > 5 && (
                      <span className="text-[10px] text-content-muted self-center">+{student.subjects.length - 5} more</span>
                    )}
                    <button
                      onClick={() => { setSelectedStudent(student); setShowAddSubjectModal(true); }}
                      className="bg-surface-subtle text-content-secondary px-2 py-0.5 rounded-full text-[10px] font-medium hover:bg-brand-primary-lt hover:text-brand-primary transition-colors"
                    >+ Add</button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleViewStudent(student)}
                    className="px-3 py-1.5 bg-brand-primary-lt text-brand-primary rounded-lg text-xs font-semibold hover:bg-brand-primary hover:text-white transition-colors min-h-[32px]"
                  >View</button>
                  <button
                    onClick={() => handleEditStudent(student)}
                    className="px-3 py-1.5 bg-surface-subtle text-content-secondary rounded-lg text-xs font-semibold hover:bg-border hover:text-content-primary transition-colors min-h-[32px]"
                  >Edit</button>
                  <button
                    onClick={() => { setSelectedStudent(student); setShowDeleteModal(true); }}
                    className="px-3 py-1.5 bg-danger-light text-danger rounded-lg text-xs font-semibold hover:bg-danger hover:text-white transition-colors min-h-[32px]"
                  >Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-border gap-3">
          <p className="text-sm text-content-muted">
            Page {page} of {Math.ceil(totalCount / LIMIT)} · {totalCount} total students
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >Previous</button>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(totalCount / LIMIT), p + 1))}
              disabled={page >= Math.ceil(totalCount / LIMIT)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >Next</button>
          </div>
        </div>
      )}

      <AnimatePresence>
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
              <h3 className={modalTitle}>Delete Student</h3>
              <p className={modalText}>
                Are you sure you want to delete {selectedStudent?.firstName} {selectedStudent?.lastName}? This action cannot be undone.
              </p>
              <div className={modalActions}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStudent}
                  className={modalButtonDanger}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

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
              <h3 className={modalTitle}>Add Subject for {selectedStudent?.firstName} {selectedStudent?.lastName}</h3>
              <div className="mb-6">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                >
                  <option value="">Select a subject</option>
                  {availableSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div className={modalActions}>
                <button
                  onClick={() => {
                    setShowAddSubjectModal(false);
                    setSelectedSubject('');
                  }}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubject}
                  disabled={!selectedSubject || addingSubject}
                  className={`px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-sm font-semibold ${(!selectedSubject || addingSubject) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {addingSubject ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}