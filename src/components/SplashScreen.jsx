'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const duration = 3000;
    const interval = 40;
    const increment = (interval / duration) * 100;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setVisible(false), 400);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(progressInterval);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #0D1220 100%)' }}
        >
          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(58,79,122,0.35) 0%, transparent 70%)',
            }}
          />

          {/* Gold corner accent */}
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-10"
            style={{ background: 'radial-gradient(circle at top right, #FFB300, transparent 70%)' }}
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.08, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 1.2, times: [0, 0.65, 1], ease: 'easeOut' }}
            className="mb-10 relative"
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glow ring behind logo */}
              <div
                className="absolute inset-0 rounded-3xl blur-xl opacity-30"
                style={{ background: 'linear-gradient(135deg, #1F2A49, #3A4F7A)' }}
              />
              <Image
                src="/logo.png"
                alt="Einstein's CBT Admin"
                width={120}
                height={120}
                priority
                className="relative w-28 h-28 object-contain rounded-3xl shadow-lg"
              />
            </motion.div>
          </motion.div>

          {/* Text block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-10 px-8"
          >
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-playfair">
              Einstein&apos;s CBT Admin
            </h1>
            <p className="text-sm text-white/50 font-medium">
              Admin Portal
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="w-full max-w-[220px] px-0"
          >
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #1F2A49, #3A4F7A, #FFB300)' }}
              />
            </div>
          </motion.div>

          {/* Pulsing dots */}
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex justify-center gap-1.5 mt-5"
          >
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full bg-white/40"
              />
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="absolute bottom-8 text-[10px] text-white/25 tracking-wide"
          >
            Powered by Mega Tech Solutions © {currentYear}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
