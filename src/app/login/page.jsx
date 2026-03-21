'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

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

  useEffect(() => { setMounted(true) }, [])

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
        setTimeout(() => router.replace('/dashboard'), 1200)
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
      {/* ── Login video loader overlay ───────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-brand-navy"
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

      {/* ── Full page dark navy gradient background ──────────── */}
      <div
        className="min-h-screen flex items-center justify-center overflow-y-auto relative py-8"
        style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #1a2340 50%, #141C33 100%)' }}
      >
        {/* Ghost logo — large decorative background element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="relative w-[520px] h-[520px]" style={{ opacity: 0.05 }}>
            <Image src="/logo.png" alt="" fill className="object-contain" priority />
          </div>
        </div>

        {/* Radial centre glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 700px 500px at 50% 50%, rgba(58,79,122,0.30) 0%, transparent 70%)' }}
        />

        {/* Top-right corner accent */}
        <div
          className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(58,79,122,0.20) 0%, transparent 70%)' }}
        />

        {/* ── Form container ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm px-6 py-8 relative z-10"
        >
          {/* ── Logo block ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative mb-5">
              {/* Blur glow ring behind logo */}
              <div
                className="absolute inset-0 rounded-full blur-2xl scale-[2]"
                style={{ background: 'rgba(58,79,122,0.40)' }}
              />
              <Image
                src="/logo.png"
                alt="Einstein's CBT App"
                width={92}
                height={92}
                priority
                className="relative z-10 object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.40))' }}
              />
            </div>

            <h1
              className="text-3xl font-bold tracking-tight text-white text-center font-playfair"
            >
              Einstein's CBT App
            </h1>
            <p className="text-sm font-normal text-white/60 text-center mt-1">
              Admin Management Console
            </p>

            {/* Admin badge */}
            <div
              className="mt-3 px-3 py-1 rounded-full border text-xs font-semibold text-white/80 tracking-widest uppercase"
              style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
            >
              Admin Portal
            </div>
          </motion.div>

          {/* ── Login form ───────────────────────────────────────── */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.4 }}
          >
            {/* Email */}
            <div>
              <label
                className="block mb-2 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-0 py-3 bg-transparent text-white text-sm font-medium border-0 border-b transition-colors duration-200 focus:outline-none"
                style={{
                  borderBottomColor: 'rgba(255,255,255,0.25)',
                  caretColor: 'white',
                }}
                onFocus={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.25)'}
                placeholder="admin@einstein-cbt.ng"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block mb-2 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-0 py-3 pr-10 bg-transparent text-white text-sm font-medium border-0 border-b transition-colors duration-200 focus:outline-none"
                  style={{
                    borderBottomColor: 'rgba(255,255,255,0.25)',
                    caretColor: 'white',
                  }}
                  onFocus={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.80)'}
                  onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.25)'}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.90)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: 'white' }}
                  disabled={loading}
                />
                <span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.60)' }}>
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.60)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.60)'}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button — INVERTED: white bg, navy text */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-brand-primary text-sm font-bold tracking-tight rounded-xl hover:bg-brand-primary-lt focus:outline-none focus:ring-2 focus:ring-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-h-[48px] mt-2"
              style={{ color: '#1F2A49' }}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In to Admin Portal'
              )}
            </button>
          </motion.form>

          {/* ── Info panel (glassmorphism) ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.4 }}
            className="rounded-xl p-4 border mb-5"
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <p
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.50)' }}
            >
              Admin Capabilities
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '👥', label: 'Student Management' },
                { icon: '📝', label: 'Exam Creation' },
                { icon: '📊', label: 'Result Analytics' },
                { icon: '⚙️', label: 'System Settings' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <span className="text-base">{icon}</span>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Register link ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32, duration: 0.4 }}
            className="text-center mb-6"
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold transition-colors"
                style={{ color: 'rgba(255,255,255,0.80)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.80)'}
              >
                Register your school →
              </Link>
            </p>
          </motion.div>

          {/* ── Footer ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.36, duration: 0.4 }}
            className="text-center"
          >
            <div
              className="pt-4 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.10)' }}
            >
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Einstein's CBT App · Admin Portal v2.0
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Powered by Mega Tech Solutions © {currentYear}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.25) !important;
        }
      `}</style>
    </>
  )
}
