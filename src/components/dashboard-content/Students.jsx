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

      {/* ── Mobile card view (< sm) ─────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-10 text-center">
            <p className="text-sm text-content-muted">No students found</p>
          </div>
        ) : filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-xl border border-border shadow-card p-4">
            {/* Header row */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
              >
                {getInitials(student)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-content-primary">{student.firstName} {student.lastName}</div>
                <div className="text-xs text-content-muted truncate">{student.email}</div>
                <div className="text-xs text-content-muted mt-0.5">ID: {student.loginId}{student.nin ? ` · NIN: ${student.nin}` : ''}</div>
              </div>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                student.status === 'active' ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'
              }`}>{student.status}</span>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-xs">
              <div><span className="text-content-muted">Class: </span><span className="font-medium text-content-primary">{student.class}</span></div>
              <div><span className="text-content-muted">Registered: </span><span className="font-medium text-content-primary">{formatDate(student.createdAt)}</span></div>
            </div>

            {/* Subjects */}
            <div className="flex flex-wrap gap-1 mb-3">
              {student.subjects?.slice(0, 4).map(subject => (
                <div key={subject} className="flex items-center gap-0.5 bg-brand-primary-lt text-brand-primary px-2 py-0.5 rounded-full text-[10px] font-medium">
                  {subject}
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveSubject(student, subject); }} className="hover:text-danger ml-0.5 leading-none" aria-label={`Remove ${subject}`}>×</button>
                </div>
              ))}
              {(student.subjects?.length || 0) > 4 && <span className="text-[10px] text-content-muted">+{student.subjects.length - 4}</span>}
              <button
                onClick={() => { setSelectedStudent(student); setShowAddSubjectModal(true); }}
                className="bg-surface-subtle text-content-secondary px-2 py-0.5 rounded-full text-[10px] font-medium hover:bg-brand-primary-lt hover:text-brand-primary transition-colors"
              >+ Add</button>
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between pt-2.5 border-t border-border">
              <button
                onClick={() => handleToggleExamMode(student)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${
                  student.examMode ? 'bg-success-light text-success-dark' : 'bg-surface-subtle text-content-secondary'
                }`}
              >
                Exam: {student.examMode ? 'On' : 'Off'}
              </button>
              <div className="flex gap-1">
                <button onClick={() => handleViewStudent(student)} className="text-brand-primary text-xs font-semibold min-h-[36px] px-2.5 rounded-lg hover:bg-brand-primary-lt transition-colors">View</button>
                <button onClick={() => handleEditStudent(student)} className="text-brand-accent text-xs font-semibold min-h-[36px] px-2.5 rounded-lg hover:bg-surface-subtle transition-colors">Edit</button>
                <button onClick={() => { setSelectedStudent(student); setShowDeleteModal(true); }} className="text-danger text-xs font-semibold min-h-[36px] px-2.5 rounded-lg hover:bg-danger-light transition-colors">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table (≥ sm) ─────────────────────────────── */}
      <div className="hidden sm:block bg-white rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wide">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wide">Login ID / NIN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wide">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wide">Subjects</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wide">Exam Mode</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wide">Registered</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-border hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}>
                        {getInitials(student)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-content-primary truncate">{student.firstName} {student.lastName}</div>
                        <div className="text-xs text-content-muted truncate mt-0.5">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-content-primary">{student.loginId}</div>
                    {student.nin && <div className="text-xs text-content-muted mt-0.5">NIN: {student.nin}</div>}
                  </td>
                  <td className="px-4 py-3"><span className="text-sm font-medium text-content-primary">{student.class}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {student.subjects?.slice(0, 3).map(subject => (
                        <div key={subject} className="flex items-center gap-0.5 bg-brand-primary-lt text-brand-primary px-2 py-0.5 rounded-full text-[10px] font-medium">
                          {subject}
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveSubject(student, subject); }} className="hover:text-danger ml-0.5 leading-none" aria-label={`Remove ${subject}`}>×</button>
                        </div>
                      ))}
                      {(student.subjects?.length || 0) > 3 && <span className="text-[10px] text-content-muted">+{student.subjects.length - 3}</span>}
                      <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setShowAddSubjectModal(true); }} className="bg-surface-subtle text-content-secondary px-2 py-0.5 rounded-full text-[10px] font-medium hover:bg-brand-primary-lt hover:text-brand-primary transition-colors">+ Add</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleExamMode(student)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors min-h-[28px] ${student.examMode ? 'bg-success-light text-success-dark' : 'bg-surface-subtle text-content-secondary'}`}
                    >{student.examMode ? 'On' : 'Off'}</button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${student.status === 'active' ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>{student.status}</span>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs text-content-muted whitespace-nowrap">{formatDate(student.createdAt)}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleViewStudent(student)} className="text-brand-primary text-xs font-semibold hover:underline min-h-[32px] px-1">View</button>
                      <button onClick={() => handleEditStudent(student)} className="text-brand-accent text-xs font-semibold hover:underline min-h-[32px] px-1">Edit</button>
                      <button onClick={() => { setSelectedStudent(student); setShowDeleteModal(true); }} className="text-danger text-xs font-semibold hover:underline min-h-[32px] px-1">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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