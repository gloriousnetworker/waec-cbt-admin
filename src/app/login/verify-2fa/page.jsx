// login/verify-2fa/page.jsx
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'

const verifyContainer = "min-h-screen bg-[#F9FAFB] flex items-center justify-center overflow-hidden"
const verifyContent = "w-full max-w-sm px-4 py-2"

function Verify2FAContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyTwoFactor } = useAuth()
  
  const userId = searchParams.get('userId')
  const tempToken = searchParams.get('tkn')
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (!userId || !tempToken || userId === 'undefined' || tempToken === 'undefined') {
      toast.error('Invalid verification link')
      router.push('/login')
    }
  }, [userId, tempToken, router])

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleChange = (index, value) => {
    if (isNaN(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) {
      toast.error('Please enter complete 6-digit code')
      return
    }

    if (!userId || !tempToken) {
      toast.error('Missing verification data')
      router.push('/login')
      return
    }

    setLoading(true)
    const verifyToast = toast.loading('Verifying code...')
    
    try {
      const result = await verifyTwoFactor(userId, token, tempToken)
      if (result.success && result.tokens) {
        toast.success('Verification successful!', { id: verifyToast })
        setTimeout(() => { router.push('/dashboard') }, 1500)
      } else {
        toast.error(result.message || 'Invalid verification code', { id: verifyToast })
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        setLoading(false)
      }
    } catch (error) {
      toast.error('Verification failed', { id: verifyToast })
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setTimeLeft(30)
    setCanResend(false)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
    toast.success('New code sent to your authenticator app')
  }

  const formatTime = (seconds) => {
    return `${seconds}s`
  }

  return (
    <div className={verifyContainer}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={verifyContent}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-6"
        >
          <h1 className="text-[40px] leading-[100%] font-[700] tracking-[-0.03em] text-[#2563EB] text-center mb-1 font-playfair">KOGI STATE</h1>
          <h2 className="text-[20px] leading-[120%] font-[600] tracking-[-0.03em] text-[#1E1E1E] text-center mb-1 font-playfair">College of Education</h2>
          <p className="text-[12px] leading-[140%] font-[400] tracking-[-0.02em] text-[#626060] text-center font-playfair">Two-Factor Authentication</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-6"
        >
          <p className="text-[13px] leading-[140%] font-[400] text-[#626060] text-center mb-6 font-playfair">
            Enter the 6-digit code from your authenticator app
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  maxLength={1}
                  className="w-12 h-14 text-center border-b-2 border-gray-300 text-[24px] font-[600] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#2563EB] transition-colors bg-transparent"
                />
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
                Code expires in: <span className="text-[#2563EB] font-[500]">{formatTime(timeLeft)}</span>
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className="text-[12px] leading-[100%] font-[500] text-[#2563EB] hover:underline font-playfair disabled:text-[#9CA3AF] disabled:no-underline disabled:cursor-not-allowed"
              >
                Resend Code
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#2563EB] text-white text-[14px] leading-[100%] font-[600] tracking-[-0.02em] rounded-md hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 transition-all font-playfair disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="mt-4 px-3 py-2 bg-[#EFF6FF] border-l-4 border-[#2563EB] rounded-r-md mb-4">
            <p className="text-[10px] leading-[140%] font-[400] text-[#1E3A8A] font-playfair">
              <strong>Note:</strong> For security reasons, this code expires in 30 seconds. If it expires, request a new one.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E8E8E8] text-center">
            <p className="text-[9px] leading-[140%] font-[400] text-[#626060] font-playfair">
              <span className="font-[600] text-[#1E1E1E]">Kogi State College of Education</span>
              <span className="mx-1">•</span>
              <span>Secure 2FA Verification</span>
            </p>
            <p className="text-[8px] leading-[140%] font-[400] text-[#9CA3AF] font-playfair mt-1">
              Powered by Mega Tech Solutions © {currentYear} All rights reserved
            </p>
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        input::placeholder {
          color: #B0B0B0 !important;
        }
      `}</style>
    </div>
  )
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-[#2563EB] font-playfair">Loading...</div>
      </div>
    }>
      <Verify2FAContent />
    </Suspense>
  )
}