// pages/_offline.jsx
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full text-center border border-[#E8E8E8] shadow-lg"
      >
        <div className="text-7xl mb-6">📡</div>
        <h1 className="text-[28px] leading-[120%] font-[700] tracking-[-0.03em] text-[#1E1E1E] mb-3 font-playfair">
          You're Offline
        </h1>
        <p className="text-[15px] leading-[150%] font-[400] text-[#626060] mb-8 font-playfair">
          Visit pages while online to use them offline.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/dashboard" 
            className="block w-full py-3.5 bg-[#039994] text-white rounded-xl font-playfair text-[15px] leading-[100%] font-[600] hover:bg-[#028a85] transition-all text-center"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/login" 
            className="block w-full py-3.5 bg-white text-[#039994] border-2 border-[#039994] rounded-xl font-playfair text-[15px] leading-[100%] font-[600] hover:bg-[#F0F9F8] transition-all text-center"
          >
            Go to Login
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 bg-white text-[#626060] border-2 border-[#E8E8E8] rounded-xl font-playfair text-[15px] leading-[100%] font-[600] hover:bg-[#F9FAFB] transition-all"
          >
            Try Again
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#E8E8E8]">
          <p className="text-[13px] leading-[140%] font-[400] text-[#9CA3AF] font-playfair">
            📚 Dashboard, Exams, and Results available offline
          </p>
        </div>
      </motion.div>
    </div>
  )
}