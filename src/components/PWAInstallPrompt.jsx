// components/PWAInstallPrompt.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const DISMISSED_KEY = 'pwa_prompt_dismissed';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Never show if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return; // iOS Safari standalone

    // Never show if user permanently dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay — don't pop over first paint
      setTimeout(() => setVisible(true), 3000);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem(DISMISSED_KEY, '1');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(DISMISSED_KEY, '1');
      }
    } finally {
      setVisible(false);
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed bottom-4 right-4 z-[9999] w-[calc(100vw-2rem)] max-w-sm"
          role="dialog"
          aria-label="Install app prompt"
        >
          <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-border overflow-hidden">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ background: 'linear-gradient(180deg, #1F2A49 0%, #3A4F7A 100%)' }} />

            <div className="pl-5 pr-4 py-4">
              {/* Header row */}
              <div className="flex items-start gap-3 mb-3">
                {/* App icon */}
                <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-border">
                  <Image
                    src="/logo.png"
                    alt="Einstein's CBT Admin"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-content-primary leading-tight">
                    Install Einstein&apos;s CBT Admin
                  </p>
                  <p className="text-xs text-content-muted mt-0.5 leading-snug">
                    Add to your home screen — works offline too.
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-content-muted hover:bg-surface-subtle hover:text-content-primary transition-colors -mt-0.5"
                  aria-label="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-primary-dk transition-colors disabled:opacity-60 min-h-[34px]"
                >
                  {installing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Installing…
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Install App
                    </>
                  )}
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-xs font-medium text-content-muted hover:text-content-primary transition-colors min-h-[34px]"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
