// login/page.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const loginContainer = "min-h-screen bg-[#F9FAFB] flex items-center justify-center overflow-hidden"
const loginContent = "w-full max-w-sm px-4 py-2"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, authChecked } = useAuth()
  const videoRef = useRef(null)
  const currentYear = new Date().getFullYear()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && authChecked && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authChecked, router, mounted])

  useEffect(() => {
    if (loading && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier || !password) {
      toast.error('Please enter your admin credentials')
      return
    }
    setLoading(true)
    const loginToast = toast.loading('Accessing Admin Portal...')
    
    try {
      const result = await login(identifier, password)
      
      if (result.requiresTwoFactor) {
        toast.dismiss(loginToast)
        if (result.userId && result.tempToken) {
          router.push(`/login/verify-2fa?userId=${result.userId}&tkn=${result.tempToken}`)
        } else {
          toast.error('Invalid 2FA response from server')
          setLoading(false)
        }
      } else if (result.success) {
        toast.success('Welcome back, Admin!', { id: loginToast })
        setTimeout(() => {
          router.replace('/dashboard')
        }, 1500)
      } else {
        toast.error(result.message || 'Invalid admin credentials', { id: loginToast })
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Authentication failed. Please try again.', { id: loginToast })
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    toast.error('Please contact your system administrator to reset your password')
  }

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white"
          >
            <video
              ref={videoRef}
              src="/loader.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={loginContainer}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={loginContent}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center mb-4"
          >
            <h1 className="text-[40px] leading-[100%] font-[700] tracking-[-0.03em] text-[#2563EB] text-center mb-1 font-playfair">KOGI STATE</h1>
            <h2 className="text-[20px] leading-[120%] font-[600] tracking-[-0.03em] text-[#1E1E1E] text-center mb-1 font-playfair">College of Education</h2>
            <p className="text-[12px] leading-[140%] font-[400] tracking-[-0.02em] text-[#626060] text-center mb-6 font-playfair">Admin Portal - Manage your school</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div>
              <label className="block mb-1 text-[12px] leading-[100%] tracking-[-0.02em] font-[500] text-[#1E1E1E] font-playfair">Email Address</label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 border-b-2 border-gray-300 text-[13px] leading-[100%] tracking-[-0.02em] font-[500] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] transition-colors bg-transparent placeholder-[#B0B0B0]"
                placeholder="admin@kogistatecollege.edu.ng"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-1 text-[12px] leading-[100%] tracking-[-0.02em] font-[500] text-[#1E1E1E] font-playfair">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-gray-300 text-[13px] leading-[100%] tracking-[-0.02em] font-[500] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] transition-colors bg-transparent placeholder-[#B0B0B0]"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#626060] hover:text-[#2563EB] transition-colors text-[18px]"
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3 h-3 border-2 border-gray-300 rounded cursor-pointer accent-[#2563EB]"
                  disabled={loading}
                />
                <span className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] leading-[100%] font-[500] text-[#2563EB] hover:underline font-playfair"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#2563EB] text-white text-[14px] leading-[100%] font-[600] tracking-[-0.02em] rounded-md hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 transition-all font-playfair disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-3 text-[11px] leading-[100%] font-[500] text-[#626060] font-playfair">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-center py-2">
                <div className="text-[20px] mb-1">👥</div>
                <div className="text-[10px] leading-[120%] font-[500] text-[#626060] font-playfair">Student Management</div>
              </div>
              <div className="text-center py-2">
                <div className="text-[20px] mb-1">📝</div>
                <div className="text-[10px] leading-[120%] font-[500] text-[#626060] font-playfair">Exam Creation</div>
              </div>
              <div className="text-center py-2">
                <div className="text-[20px] mb-1">📊</div>
                <div className="text-[10px] leading-[120%] font-[500] text-[#626060] font-playfair">Result Analytics</div>
              </div>
              <div className="text-center py-2">
                <div className="text-[20px] mb-1">⚙️</div>
                <div className="text-[10px] leading-[120%] font-[500] text-[#626060] font-playfair">System Settings</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E8E8] text-center">
              <p className="text-[9px] leading-[140%] font-[400] text-[#626060] font-playfair">
                <span className="font-[600] text-[#1E1E1E]">Kogi State College of Education</span>
                <span className="mx-1">•</span>
                <span>Admin Portal v2.0</span>
              </p>
              <p className="text-[8px] leading-[140%] font-[400] text-[#9CA3AF] font-playfair mt-1">
                Powered by Mega Tech Solutions © {currentYear} All rights reserved
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        input::placeholder {
          color: #B0B0B0 !important;
        }
      `}</style>
    </>
  )
}