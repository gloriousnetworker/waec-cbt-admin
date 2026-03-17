'use client'

import { motion, AnimatePresence } from 'framer-motion'

export default function UpdateNotification({ show, onUpdate }) {
  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <div className="bg-white rounded-xl p-4 border border-brand-primary shadow-card">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔄</div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-content-primary mb-1">
                Update Available
              </h4>
              <p className="text-xs text-content-muted mb-3">
                A new version of WAEC CBT is available. Update now for the best experience.
              </p>
              <button
                onClick={onUpdate}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-primary-dk transition-colors"
              >
                Update Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}