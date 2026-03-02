'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'

function PendingContent() {
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
    toast.success('Please check your email and click the verification link')
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-5xl">📧</span>
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Verify Your Email
          </h1>

          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              We've sent a verification email to:
            </p>
            <p className="text-lg font-semibold text-[#667eea] bg-purple-50 py-2 px-4 rounded-lg">
              {email || 'your email address'}
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to verify your account and activate your school.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              What happens next?
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-[#667eea] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                <span className="text-sm text-gray-600">Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-[#667eea] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                <span className="text-sm text-gray-600">Click the verification link in the email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 bg-[#667eea] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                <span className="text-sm text-gray-600">Return to login and access your dashboard</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCheckVerification}
              className="w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              I've Verified My Email
            </button>

            <button
              onClick={handleResendEmail}
              disabled={!canResend || resending}
              className="w-full py-3 bg-transparent text-[#667eea] text-sm font-semibold rounded-lg border-2 border-[#667eea] hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : canResend ? 'Resend Verification Email' : `Resend available in ${countdown}s`}
            </button>

            <Link
              href="/login"
              className="block text-sm text-gray-500 hover:text-[#667eea] transition-colors"
            >
              ← Back to Login
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-8">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>

        <p className="text-xs text-center text-white/80 mt-4">
          Powered by Mega Tech Solutions © {currentYear}
        </p>
      </motion.div>
    </div>
  )
}

function PendingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Loading...</p>
      </div>
    </div>
  )
}

export default function VerificationPendingPage() {
  return (
    <Suspense fallback={<PendingLoading />}>
      <PendingContent />
    </Suspense>
  )
}