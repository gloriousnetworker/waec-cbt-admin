// app/dashboard/student-registration/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const containerClass = "min-h-screen bg-surface-muted py-6 sm:py-12 px-4";
const innerClass = "max-w-5xl mx-auto";
const headerClass = "mb-8 sm:mb-10";
const backButtonClass = "inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-dk transition-colors text-sm font-medium mb-6";
const titleClass = "text-2xl sm:text-[40px] leading-[120%] font-bold tracking-tight text-content-primary font-playfair";
const subtitleClass = "text-sm sm:text-base leading-relaxed text-content-secondary mt-2";
const formGridClass = "grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6";
const formGroupClass = "space-y-2";
const labelClass = "block mb-2 text-sm font-medium text-content-primary";
const inputClass = "w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm text-content-primary transition-all min-h-[44px]";
const selectClass = "w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm text-content-primary transition-all min-h-[44px]";
const secondaryButtonClass = "px-5 sm:px-8 py-3 bg-white text-brand-primary border-2 border-brand-primary rounded-lg hover:bg-brand-primary-lt transition-all text-sm font-semibold min-h-[44px]";
const primaryButtonClass = "px-5 sm:px-8 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-all text-sm font-semibold shadow-brand min-h-[44px]";
const requiredStarClass = "text-danger ml-1";

function StudentRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchWithAuth } = useAuth();
  const isEdit = searchParams.get('edit') === 'true';
  const [studentId, setStudentId] = useState(null);
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
  const [loading, setLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [ninError, setNinError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const editStudent = localStorage.getItem('edit_student');
      if (editStudent) {
        const student = JSON.parse(editStudent);
        setStudentId(student.id);
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

  const validateNIN = (nin) => {
    if (!nin) return true;
    const ninRegex = /^\d{11}$/;
    return ninRegex.test(nin);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nin') {
      if (value && !/^\d*$/.test(value)) {
        return;
      }
      
      setFormData({
        ...formData,
        [name]: value
      });
      
      if (value && value.length !== 11) {
        setNinError('NIN must be exactly 11 digits');
      } else {
        setNinError('');
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.class) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.nin && !validateNIN(formData.nin)) {
      toast.error('NIN must be exactly 11 digits');
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/admin/students/${studentId}` : '/admin/students';
      const method = isEdit ? 'PUT' : 'POST';
      
      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        class: formData.class,
        ...(formData.middleName && { middleName: formData.middleName }),
        ...(formData.nin && { nin: formData.nin }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth })
      };

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'register'} student`);
      }

      if (isEdit) {
        toast.success('Student updated successfully!');
        localStorage.removeItem('edit_student');
        setTimeout(() => {
          router.push('/dashboard?section=students');
        }, 1500);
      } else {
        toast.success('Student registered successfully!');
        setGeneratedCredentials(data.credentials);
        
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
        setNinError('');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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
    setGeneratedCredentials(null);
    setNinError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          Back to Dashboard
        </button>

        <div className={headerClass}>
          <h1 className={titleClass}>{isEdit ? 'Edit Student' : 'Student Registration'}</h1>
          <p className={subtitleClass}>
            {isEdit ? 'Update student information in the system' : 'Register a new student for the CBT examination system'}
          </p>
        </div>

        {generatedCredentials && !isEdit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-brand-primary to-brand-primary-dk rounded-xl text-white shadow-brand"
          >
            <h3 className="text-base sm:text-lg font-bold mb-4">Student Registered Successfully!</h3>
            <div className="space-y-2">
              <p><strong>Login ID:</strong> {generatedCredentials.loginId}</p>
              <p><strong>Email:</strong> {generatedCredentials.email}</p>
              {generatedCredentials.nin && <p><strong>NIN:</strong> {generatedCredentials.nin}</p>}
              <p><strong>Default Password:</strong> <span className="font-mono bg-white/20 px-2 py-1 rounded">123456</span></p>
            </div>
            <p className="text-sm mt-4 opacity-90">Student must change this password on first login.</p>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
        >
          <div className="bg-white rounded-xl border border-border shadow-card p-5 sm:p-8">
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
                className={`${inputClass} ${ninError ? '!border-danger focus:!border-danger' : ''}`}
                placeholder="Enter 11-digit NIN (optional)"
                maxLength="11"
              />
              {ninError && (
                <p className="text-xs text-danger mt-1">{ninError}</p>
              )}
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
                className={inputClass}
                disabled
              />
              <p className="text-xs text-content-muted mt-1">
                Student can change this after first login
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 mt-8 pt-6 border-t border-border">
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
              disabled={loading}
            >
              {loading ? (isEdit ? 'Updating...' : 'Registering...') : (isEdit ? 'Update Student' : 'Register Student')}
            </button>
          </div>

          </div>{/* end card */}

          {!isEdit && (
            <p className="text-xs text-content-muted text-right mt-3">
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