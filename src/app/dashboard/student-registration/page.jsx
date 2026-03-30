// app/dashboard/student-registration/page.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { Camera, Upload, X, RefreshCw, User } from 'lucide-react';

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
    firstName: '', lastName: '', middleName: '',
    nin: '', phone: '', dateOfBirth: '', class: '', password: '123456'
  });
  const [loading, setLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [ninError, setNinError] = useState('');

  // IMG-1: Photo state
  const [photoFile, setPhotoFile]           = useState(null);   // File object
  const [photoPreview, setPhotoPreview]     = useState(null);   // DataURL for preview
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null); // Current Cloudinary URL (edit mode)
  const [showWebcam, setShowWebcam]         = useState(false);
  const [stream, setStream]                 = useState(null);
  const [capturedPhoto, setCapturedPhoto]   = useState(null);   // DataURL from webcam
  const [photoUploading, setPhotoUploading] = useState(false);
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const fileInputRef = useRef(null);

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
        if (student.photoUrl) setExistingPhotoUrl(student.photoUrl);
      }
    }
  }, [isEdit]);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  // Attach stream to video element when webcam opens
  useEffect(() => {
    if (showWebcam && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showWebcam, stream]);

  const validateNIN = (nin) => {
    if (!nin) return true;
    return /^\d{11}$/.test(nin);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nin') {
      if (value && !/^\d*$/.test(value)) return;
      setFormData({ ...formData, [name]: value });
      setNinError(value && value.length !== 11 ? 'NIN must be exactly 11 digits' : '');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ── Photo: file upload ───────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG or WebP images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setPhotoFile(file);
    setCapturedPhoto(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Photo: webcam ────────────────────────────────────────────
  const openWebcam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      setShowWebcam(true);
    } catch (_) {
      toast.error('Could not access camera. Please allow camera permission or use file upload.');
    }
  };

  const closeWebcam = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setShowWebcam(false);
  };

  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    setPhotoPreview(dataUrl);
    // Convert dataURL to File
    fetch(dataUrl).then(r => r.blob()).then(blob => {
      setPhotoFile(new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' }));
    });
    closeWebcam();
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setCapturedPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Upload photo to backend after student is created/updated ─
  const uploadPhotoForStudent = async (sid) => {
    if (!photoFile) return;
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append('photo', photoFile);
      const res = await fetchWithAuth(`/admin/students/${sid}/photo`, {
        method: 'POST',
        body: form,
        // Do NOT set Content-Type — browser sets it with boundary automatically
        headers: {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(`Photo upload failed: ${err.message || 'Unknown error'}`);
      }
    } catch (_) {
      toast.error('Photo upload failed');
    } finally {
      setPhotoUploading(false);
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
      const url    = isEdit ? `/admin/students/${studentId}` : '/admin/students';
      const method = isEdit ? 'PUT' : 'POST';
      const body   = {
        firstName: formData.firstName,
        lastName:  formData.lastName,
        class:     formData.class,
        ...(formData.middleName   && { middleName:   formData.middleName }),
        ...(formData.nin          && { nin:          formData.nin }),
        ...(formData.phone        && { phone:        formData.phone }),
        ...(formData.dateOfBirth  && { dateOfBirth:  formData.dateOfBirth })
      };

      const response = await fetchWithAuth(url, { method, body: JSON.stringify(body) });
      const data     = await response.json();

      if (!response.ok) throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'register'} student`);

      const resolvedStudentId = isEdit ? studentId : data.student?.id || data.id;

      // Upload photo if one was selected
      if (photoFile && resolvedStudentId) {
        await uploadPhotoForStudent(resolvedStudentId);
      }

      if (isEdit) {
        toast.success('Student updated successfully!');
        localStorage.removeItem('edit_student');
        setTimeout(() => router.push('/dashboard?section=students'), 1500);
      } else {
        toast.success('Student registered successfully!');
        setGeneratedCredentials(data.credentials);
        setFormData({ firstName: '', lastName: '', middleName: '', nin: '', phone: '', dateOfBirth: '', class: '', password: '123456' });
        setNinError('');
        clearPhoto();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setFormData({ firstName: '', lastName: '', middleName: '', nin: '', phone: '', dateOfBirth: '', class: '', password: '123456' });
    setGeneratedCredentials(null);
    setNinError('');
    clearPhoto();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPreview = photoPreview || existingPhotoUrl;

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        <button onClick={() => router.back()} className={backButtonClass}>
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-brand-primary to-brand-primary-dk rounded-xl text-white shadow-brand">
            <h3 className="text-base sm:text-lg font-bold mb-4">Student Registered Successfully!</h3>
            <div className="space-y-2">
              <p><strong>Login ID:</strong> {generatedCredentials.loginId}</p>
              <p><strong>Email:</strong> {generatedCredentials.email}</p>
              {generatedCredentials.nin && <p><strong>NIN:</strong> {generatedCredentials.nin}</p>}
              <p><strong>Default Password:</strong> <span className="font-mono bg-white/20 px-2 py-1 rounded">123456</span></p>
            </div>
            <p className="text-sm mt-4 opacity-90">Student must change this password on first login.</p>
            <button onClick={handleRegisterAnother} className="mt-4 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all">
              Register Another Student
            </button>
          </motion.div>
        )}

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-border shadow-card p-5 sm:p-8 space-y-8">

            {/* ── IMG-1: Photo Section ─────────────────────────────── */}
            <div>
              <h3 className="text-sm font-semibold text-content-primary mb-4 pb-2 border-b border-border flex items-center gap-2">
                <User size={15} className="text-brand-primary" /> Student Photo <span className="text-content-muted font-normal">(optional)</span>
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Preview circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 rounded-full border-2 border-border overflow-hidden bg-surface-muted flex items-center justify-center">
                    {currentPreview
                      ? <img src={currentPreview} alt="Student photo" className="w-full h-full object-cover" />
                      : <User size={40} className="text-content-muted" />}
                  </div>
                  {currentPreview && (
                    <button type="button" onClick={clearPhoto}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-danger rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors shadow">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs text-content-muted mb-1">
                    {isEdit ? 'Upload a new photo to replace the current one.' : 'Add a photo by uploading from device or using the camera.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary-lt text-brand-primary border border-brand-primary/20 rounded-lg text-sm font-medium hover:bg-brand-primary hover:text-white transition-all min-h-[36px]">
                      <Upload size={14} /> Upload Photo
                    </button>
                    <button type="button" onClick={openWebcam}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary-lt text-brand-primary border border-brand-primary/20 rounded-lg text-sm font-medium hover:bg-brand-primary hover:text-white transition-all min-h-[36px]">
                      <Camera size={14} /> Take Photo
                    </button>
                    {currentPreview && (
                      <button type="button" onClick={clearPhoto}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-content-secondary border border-border rounded-lg text-sm font-medium hover:border-danger hover:text-danger transition-all min-h-[36px]">
                        <RefreshCw size={14} /> Remove
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden" onChange={handleFileSelect} />
                  <p className="text-xs text-content-muted">JPEG, PNG or WebP · Max 5 MB · Will be cropped to square</p>
                </div>
              </div>
            </div>

            {/* ── Webcam modal ─────────────────────────────────────── */}
            {showWebcam && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h4 className="font-bold text-content-primary font-playfair">Take Student Photo</h4>
                    <button type="button" onClick={closeWebcam}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-muted text-content-muted">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      {/* Face guide overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 rounded-full border-2 border-white/50 border-dashed" />
                      </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <p className="text-xs text-content-muted text-center mt-2">Position face within the circle</p>
                  </div>
                  <div className="px-5 pb-5 flex gap-3">
                    <button type="button" onClick={closeWebcam}
                      className="flex-1 py-3 border border-border rounded-lg text-sm font-medium text-content-secondary hover:bg-surface-muted transition-all">
                      Cancel
                    </button>
                    <button type="button" onClick={capturePhoto}
                      className="flex-1 py-3 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primary-dk transition-all shadow-brand">
                      Capture Photo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Form fields ──────────────────────────────────────── */}
            <div className={formGridClass}>
              <div className={formGroupClass}>
                <label className={labelClass}>First Name <span className={requiredStarClass}>*</span></label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                  className={inputClass} placeholder="Enter first name" required />
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Last Name <span className={requiredStarClass}>*</span></label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                  className={inputClass} placeholder="Enter last name" required />
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Middle Name</label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange}
                  className={inputClass} placeholder="Enter middle name (optional)" />
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>NIN (National Identification Number)</label>
                <input type="text" name="nin" value={formData.nin} onChange={handleInputChange}
                  className={`${inputClass} ${ninError ? '!border-danger focus:!border-danger' : ''}`}
                  placeholder="Enter 11-digit NIN (optional)" maxLength="11" />
                {ninError && <p className="text-xs text-danger mt-1">{ninError}</p>}
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className={inputClass} placeholder="Enter phone number (optional)" />
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className={formGroupClass}>
                <label className={labelClass}>Class <span className={requiredStarClass}>*</span></label>
                <select name="class" value={formData.class} onChange={handleInputChange} className={selectClass} required>
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
                <input type="text" name="password" value={formData.password} className={inputClass} disabled />
                <p className="text-xs text-content-muted mt-1">Student can change this after first login</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-border">
              <button type="button" onClick={() => router.back()} className={secondaryButtonClass}>Cancel</button>
              {!isEdit && (
                <button type="button" onClick={handleRegisterAnother} className={secondaryButtonClass}>Clear Form</button>
              )}
              <button type="submit" className={primaryButtonClass} disabled={loading || photoUploading}>
                {loading ? (isEdit ? 'Updating...' : 'Registering...') : (isEdit ? 'Update Student' : 'Register Student')}
              </button>
            </div>
          </div>

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
