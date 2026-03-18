// login/verify-2fa/page.jsx
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'

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
    if (timeLeft <= 0) { setCanResend(true); return }
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleChange = (index, value) => {
    if (isNaN(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    const nextEmpty = Math.min(pasted.length, 5)
    inputRefs.current[nextEmpty]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
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
      if (result.success) {
        toast.success('Verification successful!', { id: verifyToast })
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        toast.error(result.message || 'Invalid verification code', { id: verifyToast })
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        setLoading(false)
      }
    } catch {
      toast.error('Verification failed. Please try again.', { id: verifyToast })
      setLoading(false)
    }
  }

  const handleResend = () => {
    setTimeLeft(30)
    setCanResend(false)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
    toast.success('New code sent to your authenticator app')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center overflow-hidden relative px-4"
      style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #1a2340 50%, #141C33 100%)' }}
    >
      {/* Ghost logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="relative w-[480px] h-[480px]" style={{ opacity: 0.04 }}>
          <Image src="/logo.png" alt="" fill className="object-contain" priority />
        </div>
      </div>

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 600px 500px at 50% 50%, rgba(58,79,122,0.28) 0%, transparent 70%)' }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10 py-8"
      >

        {/* ── Logo block ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-5">
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
            Two-Factor Authentication
          </p>

          {/* 2FA shield badge */}
          <div
            className="mt-3 px-3 py-1 rounded-full border text-xs font-semibold text-white/80 tracking-widest uppercase flex items-center gap-1.5"
            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
          >
            <span>🔐</span>
            <span>Secure Verification</span>
          </div>
        </motion.div>

        {/* ── Instruction text ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          className="text-sm text-center mb-7"
          style={{ color: 'rgba(255,255,255,0.60)' }}
        >
          Enter the 6-digit code from your authenticator app
        </motion.p>

        {/* ── OTP inputs ── */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.20, duration: 0.4 }}
        >
          <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                maxLength={1}
                className="w-11 h-14 text-center text-2xl font-bold text-white bg-transparent border-b-2 focus:outline-none transition-all duration-200 rounded-t-sm disabled:opacity-50"
                style={{
                  borderBottomColor: digit ? '#FFB300' : 'rgba(255,255,255,0.25)',
                  caretColor: 'white',
                  background: digit ? 'rgba(255,179,0,0.08)' : 'rgba(255,255,255,0.04)',
                }}
                onFocus={(e) => {
                  e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'
                  e.target.style.background = 'rgba(255,255,255,0.08)'
                }}
                onBlur={(e) => {
                  e.target.style.borderBottomColor = digit ? '#FFB300' : 'rgba(255,255,255,0.25)'
                  e.target.style.background = digit ? 'rgba(255,179,0,0.08)' : 'rgba(255,255,255,0.04)'
                }}
              />
            ))}
          </div>

          {/* Timer + resend */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Expires in:{' '}
              <span
                className="font-semibold tabular-nums"
                style={{ color: timeLeft <= 10 ? '#FFB300' : 'rgba(255,255,255,0.80)' }}
              >
                {timeLeft}s
              </span>
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className="text-xs font-semibold transition-colors disabled:cursor-not-allowed"
              style={{ color: canResend ? '#FFB300' : 'rgba(255,255,255,0.25)' }}
            >
              Resend Code
            </button>
          </div>

          {/* Verify button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3.5 bg-white text-sm font-bold rounded-xl hover:bg-brand-primary-lt focus:outline-none focus:ring-2 focus:ring-white/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-h-[48px]"
            style={{ color: '#1F2A49' }}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#1F2A49]/30 border-t-[#1F2A49] rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify & Continue →'
            )}
          </button>
        </motion.form>

        {/* ── Security note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.30, duration: 0.4 }}
          className="mt-5 rounded-xl px-4 py-3 border-l-4"
          style={{
            background: 'rgba(255,179,0,0.07)',
            borderLeftColor: '#FFB300',
            border: '1px solid rgba(255,179,0,0.15)',
            borderLeft: '4px solid #FFB300',
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
            <span className="font-semibold text-white/80">Security tip:</span> This code expires in 30 seconds.
            Never share it with anyone. If it expires, request a new one.
          </p>
        </motion.div>

        {/* ── Back to login ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.4 }}
          className="text-center mt-5"
        >
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-xs font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.90)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            ← Back to Login
          </button>
        </motion.div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className="text-center mt-6 pt-4 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.10)' }}
        >
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Einstein's CBT App · Admin Portal v2.0
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Powered by Mega Tech Solutions © {currentYear}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function Verify2FAPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-sm text-white/50">Loading...</p>
          </div>
        </div>
      }
    >
      <Verify2FAContent />
    </Suspense>
  )
}
