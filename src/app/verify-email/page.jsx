'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// Main component that uses useSearchParams
function VerifyEmailContent() {
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyEmail } = useAuth()
  const token = searchParams.get('token')
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false)
        setError('No verification token provided')
        return
      }

      try {
        const result = await verifyEmail(token)
        
        if (result.success) {
          setSuccess(true)
          toast.success('Email verified successfully!')
          
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setError(result.message || 'Verification failed')
        }
      } catch (error) {
        setError('An error occurred during verification')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token, verifyEmail, router])

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            {verifying ? (
              <div className="w-24 h-24 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-5xl">✅</span>
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-5xl">❌</span>
              </div>
            )}
          </motion.div>

          {/* Title */}
          <h1 className="text-[24px] font-[700] text-[#1E1E1E] mb-3 font-playfair">
            {verifying ? 'Verifying Your Email...' : success ? 'Email Verified!' : 'Verification Failed'}
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-8">
            {verifying ? (
              <p className="text-[14px] text-[#626060] font-playfair">
                Please wait while we verify your email address.
              </p>
            ) : success ? (
              <>
                <p className="text-[14px] text-[#626060] font-playfair">
                  Your email has been successfully verified!
                </p>
                <p className="text-[13px] text-[#626060] bg-green-50 p-3 rounded-lg font-playfair">
                  Your account is now active. You'll be redirected to the login page in 3 seconds...
                </p>
              </>
            ) : (
              <>
                <p className="text-[14px] text-[#626060] font-playfair">
                  {error || 'The verification link is invalid or has expired.'}
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-[13px] text-red-600 font-playfair">
                    Please try registering again or contact support.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {success ? (
              <Link
                href="/login"
                className="block w-full py-3 bg-[#2563EB] text-white text-[14px] font-[600] rounded-lg hover:bg-[#1D4ED8] transition-colors font-playfair"
              >
                Go to Login
              </Link>
            ) : !verifying && !success ? (
              <>
                <Link
                  href="/register"
                  className="block w-full py-3 bg-[#2563EB] text-white text-[14px] font-[600] rounded-lg hover:bg-[#1D4ED8] transition-colors font-playfair"
                >
                  Register Again
                </Link>
                <Link
                  href="/login"
                  className="block text-[13px] text-[#626060] hover:text-[#2563EB] transition-colors font-playfair"
                >
                  Back to Login
                </Link>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[8px] text-center text-[#9CA3AF] font-playfair mt-4">
          Powered by Mega Tech Solutions © {currentYear}
        </p>
      </motion.div>
    </div>
  )
}

// Loading fallback for Suspense
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#626060] font-playfair">Loading verification page...</p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}