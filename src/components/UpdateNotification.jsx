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
        <div className="bg-white rounded-xl p-4 border border-[#039994] shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔄</div>
            <div className="flex-1">
              <h4 className="text-[14px] leading-[120%] font-[600] text-[#1E1E1E] mb-1 font-playfair">
                Update Available
              </h4>
              <p className="text-[12px] leading-[140%] font-[400] text-[#626060] mb-3 font-playfair">
                A new version of WAEC CBT is available. Update now for the best experience.
              </p>
              <button
                onClick={onUpdate}
                className="px-4 py-2 bg-[#039994] text-white rounded-lg font-playfair text-[12px] leading-[100%] font-[600] hover:bg-[#028a85] transition-colors"
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