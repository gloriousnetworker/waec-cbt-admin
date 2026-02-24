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
} from '../styles';

export default function Students({ setActiveSection }) {
  const router = useRouter();
  const { user, fetchWithAuth } = useAuth();
  const [students, setStudents] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetchWithAuth('/admin/students');
      
      if (!response || !response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    try {
      const response = await fetchWithAuth(`/admin/students/${selectedStudent.id}`, {
        method: 'DELETE'
      });

      if (!response || !response.ok) {
        throw new Error('Failed to delete student');
      }

      setStudents(students.filter(s => s.id !== selectedStudent.id));
      toast.success('Student deleted successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDeleteModal(false);
      setSelectedStudent(null);
    }
  };

  const handleViewStudent = async (student) => {
    try {
      const response = await fetchWithAuth(`/admin/students/${student.id}`);

      if (!response || !response.ok) {
        throw new Error('Failed to fetch student details');
      }

      const data = await response.json();
      localStorage.setItem('selected_student', JSON.stringify(data.student));
      localStorage.setItem('student_performance', JSON.stringify(data.performance));
      localStorage.setItem('student_exams', JSON.stringify(data.exams));
      setActiveSection('performance');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditStudent = (student) => {
    localStorage.setItem('edit_student', JSON.stringify(student));
    router.push('/dashboard/student-registration?edit=true');
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.loginId && s.loginId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.nin && s.nin.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (student) => {
    if (!student || !student.firstName || !student.lastName) return 'ST';
    return `${student.firstName[0] || ''}${student.lastName[0] || ''}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return 'N/A';
    return new Date(timestamp._seconds * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="text-[18px] text-[#626060]">Loading students...</div>
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

      <div className="mb-6 flex justify-between items-center">
        <div className="w-96">
          <input
            type="text"
            placeholder="Search students by name, email, login ID or NIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] font-playfair text-[13px]"
          />
        </div>
        <button
          onClick={() => router.push('/dashboard/student-registration')}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors font-playfair text-[13px] leading-[100%] font-[600]"
        >
          + Add New Student
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Student</th>
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Login ID / NIN</th>
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Class</th>
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Status</th>
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Registered</th>
              <th className="px-6 py-4 text-left text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[14px] leading-[100%] font-[600] font-playfair">
                      {getInitials(student)}
                    </div>
                    <div>
                      <div className="font-[600] text-[13px] leading-[100%] text-[#1E1E1E] font-playfair">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">
                        {student.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">{student.loginId}</div>
                  {student.nin && (
                    <div className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">NIN: {student.nin}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-[13px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">{student.class}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] ${
                    student.status === 'active' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
                    {formatDate(student.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="text-[#2563EB] text-[12px] leading-[100%] font-[500] hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-[#2563EB] text-[12px] leading-[100%] font-[500] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowDeleteModal(true);
                      }}
                      className="text-[#DC2626] text-[12px] leading-[100%] font-[500] hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
      </AnimatePresence>
    </div>
  );
}