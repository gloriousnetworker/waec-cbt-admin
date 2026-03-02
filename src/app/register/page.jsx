'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
    schoolPhone: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()
  const { register, isAuthenticated } = useAuth()
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'password') {
      // Calculate password strength
      let strength = 0
      if (value.length >= 8) strength++
      if (value.match(/[a-z]/)) strength++
      if (value.match(/[A-Z]/)) strength++
      if (value.match(/[0-9]/)) strength++
      if (value.match(/[^a-zA-Z0-9]/)) strength++
      setPasswordStrength(strength)
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    if (!formData.name) {
      toast.error('Please enter your full name')
      return false
    }
    if (!formData.schoolName) {
      toast.error('Please enter your school name')
      return false
    }
    if (!formData.schoolAddress) {
      toast.error('Please enter your school address')
      return false
    }
    if (!formData.schoolPhone) {
      toast.error('Please enter your school phone number')
      return false
    }
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
        toast.success('Registration successful! Please check your email to verify your account.', { id: registerToast })
        
        // Store email for reference
        sessionStorage.setItem('registeredEmail', formData.email)
        
        // Redirect to verification pending page
        setTimeout(() => {
          router.push(`/verify-email/pending?email=${encodeURIComponent(formData.email)}`)
        }, 2000)
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

  const getStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    return colors[passwordStrength] || 'bg-gray-300'
  }

  const getStrengthText = () => {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    return texts[passwordStrength] || 'Too Weak'
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block mb-4">
            <span className="text-[#2563EB] text-sm font-playfair hover:underline">← Back to Login</span>
          </Link>
          <h1 className="text-[32px] leading-[120%] font-[700] tracking-[-0.03em] text-[#2563EB] mb-2 font-playfair">
            Register Your School
          </h1>
          <p className="text-[14px] leading-[140%] font-[400] text-[#626060] font-playfair">
            Join the Einstein CBT Platform and start managing your exams digitally
          </p>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Admin Information */}
            <div>
              <h2 className="text-[18px] font-[600] text-[#1E1E1E] mb-4 font-playfair">Administrator Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-[13px] font-[500] text-[#1E1E1E] font-playfair">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-[400] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[13px] font-[500] text-[#1E1E1E] font-playfair">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-[400] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    placeholder="admin@yourschool.edu.ng"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[13px] font-[500] text-[#1E1E1E] font-playfair">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-[400] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                      placeholder="Create a strong password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#626060] hover:text-[#2563EB] transition-colors"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getStrengthColor()} transition-all duration-300`}
                            style={{ width: `${(passwordStrength + 1) * 20}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-[500] text-[#626060]">
                          {getStrengthText()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF]">
                        Use at least 8 characters with a mix of letters, numbers & symbols
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-[13px] font-[500] text-[#1E1E1E] font-playfair">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-[400] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                      placeholder="Re-enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#626060] hover:text-[#2563EB] transition-colors"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-[11px] text-red-500">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>

            {/* School Information */}
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-[18px] font-[600] text-[#1E1E1E] mb-4 font-playfair">School Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-[13px] font-[500] text-[#1E1E1E] font-playfair">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-[400] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    placeholder="Enter your school name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[13px] font-[500] text-[#1E1E1E] font-playfair">
                    School Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="schoolAddress"
                    value={formData.schoolAddress}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-[400] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all resize-none"
                    placeholder="Enter complete school address"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[13px] font-[500] text-[#1E1E1E] font-playfair">
                    School Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="schoolPhone"
                    value={formData.schoolPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-[400] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    placeholder="+234 123 456 7890"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="pt-4">
              <p className="text-[12px] text-[#9CA3AF] mb-4 font-playfair">
                By registering, you agree to our{' '}
                <Link href="/terms" className="text-[#2563EB] hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#2563EB] hover:underline">Privacy Policy</Link>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2563EB] text-white text-[16px] font-[600] rounded-lg hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 transition-all font-playfair disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Register School'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[10px] leading-[140%] font-[400] text-[#9CA3AF] font-playfair">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2563EB] hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-[8px] leading-[140%] font-[400] text-[#9CA3AF] font-playfair mt-4">
            Powered by Mega Tech Solutions © {currentYear} All rights reserved
          </p>
        </div>
      </motion.div>
    </div>
  )
}