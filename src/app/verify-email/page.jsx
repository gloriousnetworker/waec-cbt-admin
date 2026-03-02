'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function VerifyContent() {
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
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            {verifying ? (
              <div className="w-24 h-24 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin" />
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

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            {verifying ? 'Verifying Your Email...' : success ? 'Email Verified!' : 'Verification Failed'}
          </h1>

          <div className="space-y-4 mb-8">
            {verifying ? (
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            ) : success ? (
              <>
                <p className="text-gray-600">
                  Your email has been successfully verified!
                </p>
                <p className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
                  Your account is now active. You'll be redirected to the login page in 3 seconds...
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600">
                  {error || 'The verification link is invalid or has expired.'}
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">
                    Please try registering again or contact support.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            {success ? (
              <Link
                href="/login"
                className="block w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Login
              </Link>
            ) : !verifying && !success ? (
              <>
                <Link
                  href="/register"
                  className="block w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Register Again
                </Link>
                <Link
                  href="/login"
                  className="block text-sm text-gray-500 hover:text-[#667eea] transition-colors"
                >
                  Back to Login
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <p className="text-xs text-center text-white/80 mt-4">
          Powered by Mega Tech Solutions © {currentYear}
        </p>
      </motion.div>
    </div>
  )
}

function VerifyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Loading verification page...</p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  )
}