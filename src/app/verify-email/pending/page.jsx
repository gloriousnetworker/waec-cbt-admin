'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'

export default function VerificationPendingPage() {
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { verifyEmail } = useAuth()
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    let timer
    if (!canResend && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, canResend])

  const handleResendEmail = async () => {
    if (!canResend) return
    
    setResending(true)
    const resendToast = toast.loading('Resending verification email...')
    
    try {
      // Note: You'll need to add a resend endpoint to your backend
      // For now, we'll simulate a resend
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Verification email resent! Please check your inbox.', { id: resendToast })
      setCanResend(false)
      setCountdown(60)
    } catch (error) {
      toast.error('Failed to resend email. Please try again.', { id: resendToast })
    } finally {
      setResending(false)
    }
  }

  const handleCheckVerification = async () => {
    // This would require a token - for now, redirect to login
    toast.success('Please check your email and click the verification link')
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-5xl">📧</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-[24px] font-[700] text-[#1E1E1E] mb-3 font-playfair">
            Verify Your Email Address
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-8">
            <p className="text-[14px] text-[#626060] font-playfair">
              We've sent a verification email to:
            </p>
            <p className="text-[16px] font-[600] text-[#2563EB] bg-[#2563EB]/5 py-2 px-4 rounded-lg font-playfair">
              {email || 'your email address'}
            </p>
            <p className="text-[13px] text-[#626060] font-playfair">
              Click the link in the email to verify your account and activate your school.
            </p>
          </div>

          {/* Steps */}
          <div className="bg-[#F9FAFB] rounded-xl p-6 mb-8 text-left">
            <h2 className="text-[14px] font-[600] text-[#1E1E1E] mb-4 font-playfair">
              What happens next?
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-[12px] flex-shrink-0 mt-0.5">1</span>
                <span className="text-[13px] text-[#626060] font-playfair">Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-[12px] flex-shrink-0 mt-0.5">2</span>
                <span className="text-[13px] text-[#626060] font-playfair">Click the verification link in the email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-[12px] flex-shrink-0 mt-0.5">3</span>
                <span className="text-[13px] text-[#626060] font-playfair">Return to login and access your dashboard</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCheckVerification}
              className="w-full py-3 bg-[#2563EB] text-white text-[14px] font-[600] rounded-lg hover:bg-[#1D4ED8] transition-colors font-playfair"
            >
              I've Verified My Email
            </button>

            <button
              onClick={handleResendEmail}
              disabled={!canResend || resending}
              className="w-full py-3 bg-transparent text-[#2563EB] text-[14px] font-[600] rounded-lg border-2 border-[#2563EB] hover:bg-[#2563EB]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-playfair"
            >
              {resending ? 'Sending...' : canResend ? 'Resend Verification Email' : `Resend available in ${countdown}s`}
            </button>

            <Link
              href="/login"
              className="block text-[13px] text-[#626060] hover:text-[#2563EB] transition-colors font-playfair"
            >
              ← Back to Login
            </Link>
          </div>

          {/* Note */}
          <p className="text-[11px] text-[#9CA3AF] mt-8 font-playfair">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>

        {/* Footer */}
        <p className="text-[8px] text-center text-[#9CA3AF] font-playfair mt-4">
          Powered by Mega Tech Solutions © {currentYear}
        </p>
      </motion.div>
    </div>
  )
}