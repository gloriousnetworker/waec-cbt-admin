// app/not-found.jsx
'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #FFB300 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3A4F7A 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
          className="mb-8"
        >
          <Image
            src="/logo.png"
            alt="Einstein's CBT Admin"
            width={80}
            height={80}
            className="rounded-2xl shadow-lg"
            priority
          />
        </motion.div>

        {/* 404 number */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-[96px] font-bold leading-none mb-2 font-playfair"
          style={{ color: '#FFB300' }}
        >
          404
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-2xl font-bold text-white mb-3 tracking-tight"
        >
          Page Not Found
        </motion.h1>

        {/* Sub-message */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="text-sm text-white/60 mb-10 leading-relaxed"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Let&apos;s get you back on track.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <button
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors min-h-[48px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>

          <button
            onClick={() => router.push('/login')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-primary text-sm font-bold hover:bg-white/90 transition-colors min-h-[48px] shadow-sm"
          >
            Return to Login
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="mt-10 text-[11px] text-white/30"
        >
          Einstein&apos;s CBT Admin — Mega Tech Solutions
        </motion.p>
      </motion.div>
    </div>
  );
}
