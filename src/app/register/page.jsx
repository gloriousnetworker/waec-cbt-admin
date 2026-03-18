'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()
  const { register, isAuthenticated } = useAuth()
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password') {
      let s = 0
      if (value.length >= 8) s++
      if (value.match(/[a-z]/)) s++
      if (value.match(/[A-Z]/)) s++
      if (value.match(/[0-9]/)) s++
      if (value.match(/[^a-zA-Z0-9]/)) s++
      setPasswordStrength(s)
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address'); return false
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match'); return false
    }
    if (!formData.name) { toast.error('Please enter your full name'); return false }
    if (!formData.schoolName) { toast.error('Please enter your school name'); return false }
    if (!formData.schoolAddress) { toast.error('Please enter your school address'); return false }
    if (!formData.schoolPhone) { toast.error('Please enter your school phone number'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const registerToast = toast.loading('Creating your school account...')
    try {
      const { confirmPassword, ...registerData } = formData
      const result = await register(registerData)
      if (result.success) {
        toast.success('Registration successful! Check your email to verify your account.', { id: registerToast })
        sessionStorage.setItem('registeredEmail', formData.email)
        setTimeout(() => router.push(`/verify-email/pending?email=${encodeURIComponent(formData.email)}`), 2000)
      } else {
        toast.error(result.message || 'Registration failed', { id: registerToast })
        setLoading(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An error occurred. Please try again.', { id: registerToast })
      setLoading(false)
    }
  }

  // Password strength helpers
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e']
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = formData.password ? strengthColors[passwordStrength] ?? strengthColors[0] : null
  const strengthLabel = formData.password ? strengthLabels[passwordStrength] ?? 'Very Weak' : null

  // Shared input style
  const inputCls = [
    'w-full px-0 py-2.5 bg-transparent text-white text-sm font-medium',
    'border-0 border-b transition-colors duration-200 focus:outline-none',
    'placeholder:text-white/25 disabled:opacity-40',
  ].join(' ')

  const labelCls = 'block mb-1.5 text-xs font-medium uppercase tracking-wider text-white/60'

  return (
    <div
      className="min-h-screen flex items-start justify-center overflow-x-hidden relative py-10 px-4"
      style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #1a2340 50%, #141C33 100%)' }}
    >
      {/* Ghost logo watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="relative w-[600px] h-[600px]" style={{ opacity: 0.04 }}>
          <Image src="/logo.png" alt="" fill className="object-contain" priority />
        </div>
      </div>

      {/* Radial centre glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 800px 600px at 50% 40%, rgba(58,79,122,0.28) 0%, transparent 70%)' }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-xl relative z-10"
      >

        {/* ── Logo block ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <div
              className="absolute inset-0 rounded-full blur-2xl scale-[2]"
              style={{ background: 'rgba(58,79,122,0.40)' }}
            />
            <Image
              src="/logo.png"
              alt="Einstein's CBT App"
              width={80}
              height={80}
              priority
              className="relative z-10 object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.40))' }}
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white text-center font-playfair">
            Einstein's CBT Admin
          </h1>
          <p className="text-sm text-white/60 text-center mt-1">
            Register your school to get started
          </p>

          {/* Badge */}
          <div
            className="mt-3 px-3 py-1 rounded-full border text-xs font-semibold text-white/80 tracking-widest uppercase"
            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
          >
            School Registration
          </div>
        </motion.div>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Section: Admin Info ── */}
            <div>
              <h2 className="font-playfair text-base font-bold text-white mb-5 flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,179,0,0.15)', color: '#FFB300' }}
                >1</span>
                Administrator Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Full Name <span className="text-[#FFB300]">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputCls}
                    style={{ borderBottomColor: 'rgba(255,255,255,0.20)', caretColor: 'white' }}
                    onFocus={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'}
                    onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.20)'}
                    placeholder="Your full name"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Email Address <span className="text-[#FFB300]">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputCls}
                    style={{ borderBottomColor: 'rgba(255,255,255,0.20)', caretColor: 'white' }}
                    onFocus={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'}
                    onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.20)'}
                    placeholder="admin@yourschool.edu.ng"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className={labelCls}>Password <span className="text-[#FFB300]">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputCls} pr-10`}
                      style={{ borderBottomColor: 'rgba(255,255,255,0.20)', caretColor: 'white' }}
                      onFocus={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'}
                      onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.20)'}
                      placeholder="Create a strong password"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                      style={{ color: 'rgba(255,255,255,0.40)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.90)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.40)'}
                      tabIndex={-1}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(passwordStrength + 1) * 20}%`,
                              background: strengthColor,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: strengthColor }}>
                          {strengthLabel}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Use 8+ characters with letters, numbers & symbols
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelCls}>Confirm Password <span className="text-[#FFB300]">*</span></label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`${inputCls} pr-10`}
                      style={{
                        borderBottomColor: formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? '#ef4444'
                          : 'rgba(255,255,255,0.20)',
                        caretColor: 'white',
                      }}
                      onFocus={e => {
                        if (!(formData.confirmPassword && formData.password !== formData.confirmPassword)) {
                          e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'
                        }
                      }}
                      onBlur={e => {
                        e.target.style.borderBottomColor =
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? '#ef4444'
                            : 'rgba(255,255,255,0.20)'
                      }}
                      placeholder="Re-enter your password"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                      style={{ color: 'rgba(255,255,255,0.40)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.90)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.40)'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

            {/* ── Section: School Info ── */}
            <div>
              <h2 className="font-playfair text-base font-bold text-white mb-5 flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,179,0,0.15)', color: '#FFB300' }}
                >2</span>
                School Information
              </h2>

              <div className="space-y-6">
                {/* School Name */}
                <div>
                  <label className={labelCls}>School Name <span className="text-[#FFB300]">*</span></label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className={inputCls}
                    style={{ borderBottomColor: 'rgba(255,255,255,0.20)', caretColor: 'white' }}
                    onFocus={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'}
                    onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.20)'}
                    placeholder="e.g. Government Secondary School, Lokoja"
                    disabled={loading}
                  />
                </div>

                {/* School Address */}
                <div>
                  <label className={labelCls}>School Address <span className="text-[#FFB300]">*</span></label>
                  <textarea
                    name="schoolAddress"
                    value={formData.schoolAddress}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputCls} resize-none`}
                    style={{ borderBottomColor: 'rgba(255,255,255,0.20)', caretColor: 'white' }}
                    onFocus={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'}
                    onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.20)'}
                    placeholder="Complete school address"
                    disabled={loading}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className={labelCls}>School Phone Number <span className="text-[#FFB300]">*</span></label>
                  <input
                    type="tel"
                    name="schoolPhone"
                    value={formData.schoolPhone}
                    onChange={handleChange}
                    className={inputCls}
                    style={{ borderBottomColor: 'rgba(255,255,255,0.20)', caretColor: 'white' }}
                    onFocus={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'}
                    onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.20)'}
                    placeholder="+234 800 000 0000"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* ── Terms + Submit ── */}
            <div className="pt-2">
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                By registering, you agree to our{' '}
                <Link href="/terms" className="font-medium underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="font-medium underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
                  Privacy Policy
                </Link>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-sm font-bold rounded-xl hover:bg-brand-primary-lt focus:outline-none focus:ring-2 focus:ring-white/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-h-[48px]"
                style={{ color: '#1F2A49' }}
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#1F2A49]/30 border-t-[#1F2A49] rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  'Create School Account →'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* ── Login link + footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.80)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.80)'}
            >
              Sign in →
            </Link>
          </p>

          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Einstein's CBT App · Admin Portal v2.0
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.20)' }}>
              Powered by Mega Tech Solutions © {currentYear}
            </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
