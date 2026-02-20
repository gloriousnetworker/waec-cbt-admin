'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const containerClass = "min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] py-12 px-4";
const innerClass = "max-w-5xl mx-auto";
const headerClass = "mb-10";
const backButtonClass = "inline-flex items-center gap-2 text-[#2563EB] hover:text-[#1D4ED8] transition-colors text-[15px] leading-[100%] font-[500] font-playfair mb-6";
const titleClass = "text-[40px] leading-[120%] font-[700] tracking-[-0.02em] text-[#1E1E1E] font-playfair";
const subtitleClass = "text-[18px] leading-[140%] font-[400] text-[#4B5563] mt-3 font-playfair";
const formGridClass = "grid grid-cols-2 gap-8";
const formGroupClass = "space-y-2";
const labelClass = "block text-[15px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair mb-2";
const inputClass = "w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 text-[15px] leading-[100%] font-[400] font-playfair transition-all";
const selectClass = "w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 text-[15px] leading-[100%] font-[400] font-playfair transition-all";
const secondaryButtonClass = "px-8 py-4 bg-white text-[#2563EB] border-2 border-[#2563EB] rounded-xl hover:bg-[#EFF6FF] transition-all font-playfair text-[15px] leading-[100%] font-[600]";
const primaryButtonClass = "px-8 py-4 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all font-playfair text-[15px] leading-[100%] font-[600] shadow-lg shadow-[#2563EB]/20";
const previewCardClass = "mt-10 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-2xl p-8 text-white";
const requiredStarClass = "text-[#DC2626] ml-1 text-lg";

function StudentRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === 'true';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    nin: '',
    phone: '',
    dateOfBirth: '',
    class: '',
    password: '123456'
  });

  useEffect(() => {
    if (isEdit) {
      const editStudent = localStorage.getItem('edit_student');
      if (editStudent) {
        const student = JSON.parse(editStudent);
        setFormData({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          middleName: student.middleName || '',
          nin: student.nin || '',
          phone: student.phone || '',
          dateOfBirth: student.dateOfBirth || '',
          class: student.class || '',
          password: '123456'
        });
      }
    }
  }, [isEdit]);

  const generateLoginId = (firstName, lastName) => {
    if (!firstName || !lastName) return '';
    const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, '');
    const students = JSON.parse(localStorage.getItem('school_students') || '[]');
    
    const similar = students.filter(s => 
      s.loginId?.startsWith(base) || 
      s.email?.startsWith(`${firstName.toLowerCase()}.${lastName.toLowerCase()}`)
    );
    
    if (similar.length === 0) return base;
    
    let counter = 1;
    let newLoginId = `${base}${counter.toString().padStart(3, '0')}`;
    
    while (students.some(s => s.loginId === newLoginId)) {
      counter++;
      newLoginId = `${base}${counter.toString().padStart(3, '0')}`;
    }
    
    return newLoginId;
  };

  const generateEmail = (loginId) => {
    if (!loginId) return '';
    return `${loginId}@kogistatecollege.edu.ng`;
  };

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const students = JSON.parse(localStorage.getItem('school_students') || '[]');
    const count = students.length + 1;
    return `STU/${year}/${count.toString().padStart(4, '0')}`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.class) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const existingStudents = JSON.parse(localStorage.getItem('school_students') || '[]');
    
    if (!isEdit) {
      const loginId = generateLoginId(formData.firstName, formData.lastName);
      const email = generateEmail(loginId);
      
      const duplicate = existingStudents.find(s => 
        (s.nin && s.nin === formData.nin) || 
        s.email === email
      );
      
      if (duplicate) {
        toast.error('A student with this NIN or email already exists!');
        return;
      }
    }
    
    const loginId = generateLoginId(formData.firstName, formData.lastName);
    const email = generateEmail(loginId);
    
    const studentData = {
      id: isEdit ? JSON.parse(localStorage.getItem('edit_student')).id : generateStudentId(),
      ...formData,
      email,
      loginId,
      subjects: ['Mathematics', 'English'],
      registeredAt: isEdit ? JSON.parse(localStorage.getItem('edit_student')).registeredAt : new Date().toISOString(),
      lastActive: isEdit ? JSON.parse(localStorage.getItem('edit_student')).lastActive : new Date().toISOString().split('T')[0],
      examsTaken: isEdit ? JSON.parse(localStorage.getItem('edit_student')).examsTaken || 0 : 0,
      avgScore: isEdit ? JSON.parse(localStorage.getItem('edit_student')).avgScore || 0 : 0
    };

    let updatedStudents;
    if (isEdit) {
      updatedStudents = existingStudents.map(s => 
        s.id === studentData.id ? studentData : s
      );
      toast.success('Student updated successfully!');
    } else {
      updatedStudents = [...existingStudents, studentData];
      toast.success('Student registered successfully!');
    }
    
    localStorage.setItem('school_students', JSON.stringify(updatedStudents));
    localStorage.removeItem('edit_student');
    
    if (!isEdit) {
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        nin: '',
        phone: '',
        dateOfBirth: '',
        class: '',
        password: '123456'
      });
    } else {
      router.push('/dashboard/students');
    }
  };

  const handleRegisterAnother = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      nin: '',
      phone: '',
      dateOfBirth: '',
      class: '',
      password: '123456'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginId = generateLoginId(formData.firstName, formData.lastName);
  const email = generateEmail(loginId);

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        <button
          onClick={() => router.back()}
          className={backButtonClass}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Students
        </button>

        <div className={headerClass}>
          <h1 className={titleClass}>{isEdit ? 'Edit Student' : 'Student Registration'}</h1>
          <p className={subtitleClass}>
            {isEdit ? 'Update student information in the system' : 'Register a new student for the CBT examination system'}
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
        >
          <div className={formGridClass}>
            <div className={formGroupClass}>
              <label className={labelClass}>
                First Name <span className={requiredStarClass}>*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className={formGroupClass}>
              <label className={labelClass}>
                Last Name <span className={requiredStarClass}>*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className={formGroupClass}>
              <label className={labelClass}>Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Enter middle name (optional)"
              />
            </div>

            <div className={formGroupClass}>
              <label className={labelClass}>NIN (National Identification Number)</label>
              <input
                type="text"
                name="nin"
                value={formData.nin}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Enter NIN (optional)"
              />
            </div>

            <div className={formGroupClass}>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Enter phone number (optional)"
              />
            </div>

            <div className={formGroupClass}>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

            <div className={formGroupClass}>
              <label className={labelClass}>
                Class <span className={requiredStarClass}>*</span>
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className={selectClass}
                required
              >
                <option value="">Select Class</option>
                <option value="JSS1">JSS 1</option>
                <option value="JSS2">JSS 2</option>
                <option value="JSS3">JSS 3</option>
                <option value="SS1">SS 1</option>
                <option value="SS2">SS 2</option>
                <option value="SS3">SS 3</option>
              </select>
            </div>

            <div className={formGroupClass}>
              <label className={labelClass}>Default Password</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="123456"
              />
              <p className="text-[13px] leading-[140%] font-[400] text-[#6B7280] font-playfair mt-2">
                Student can change this after first login
              </p>
            </div>
          </div>

          {!isEdit && formData.firstName && formData.lastName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={previewCardClass}
            >
              <h3 className="text-[20px] leading-[120%] font-[600] mb-4 font-playfair">Login Credentials Preview</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[14px] leading-[100%] font-[400] text-white/80 mb-2 font-playfair">Login ID</p>
                  <p className="text-[18px] leading-[100%] font-[600] font-playfair">{loginId}</p>
                </div>
                <div>
                  <p className="text-[14px] leading-[100%] font-[400] text-white/80 mb-2 font-playfair">Email Address</p>
                  <p className="text-[18px] leading-[100%] font-[600] font-playfair">{email}</p>
                </div>
                <div>
                  <p className="text-[14px] leading-[100%] font-[400] text-white/80 mb-2 font-playfair">Password</p>
                  <p className="text-[18px] leading-[100%] font-[600] font-playfair">{formData.password}</p>
                </div>
                <div>
                  <p className="text-[14px] leading-[100%] font-[400] text-white/80 mb-2 font-playfair">Alternative Login</p>
                  <p className="text-[18px] leading-[100%] font-[600] font-playfair">NIN + Password</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-4 mt-10">
            <button
              type="button"
              onClick={() => router.back()}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
            {!isEdit && (
              <button
                type="button"
                onClick={handleRegisterAnother}
                className={secondaryButtonClass}
              >
                Clear Form
              </button>
            )}
            <button
              type="submit"
              className={primaryButtonClass}
            >
              {isEdit ? 'Update Student' : 'Register Student'}
            </button>
          </div>

          {!isEdit && (
            <p className="text-[13px] leading-[140%] font-[400] text-[#6B7280] font-playfair text-right mt-4">
              Fields marked with <span className={requiredStarClass}>*</span> are required
            </p>
          )}
        </motion.form>
      </div>
    </div>
  );
}

export default function StudentRegistrationPage() {
  return (
    <ProtectedRoute>
      <StudentRegistrationContent />
    </ProtectedRoute>
  );
}