'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setVisible(false), 300);
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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ 
              scale: [0.3, 1.1, 1],
              opacity: [0, 1, 1]
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.6, 1],
              ease: "easeInOut"
            }}
            className="mb-12"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/logo.png"
                alt="School Logo"
                width={200}
                height={200}
                priority
                className="w-48 h-48 object-contain"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="w-full max-w-sm px-8"
          >
            <div className="mb-4">
              <div className="w-full h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                  className="h-full bg-[#2563EB] rounded-full"
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-[20px] leading-[120%] font-[700] tracking-[-0.03em] text-[#2563EB] mb-2 font-playfair">
                Kogi State College of Education
              </h2>
              <p className="text-[11px] leading-[140%] font-[400] text-[#626060] font-playfair mb-1">
                Admin Portal
              </p>
              <p className="text-[9px] leading-[140%] font-[400] text-[#B0B0B0] font-playfair">
                Powered by Mega Tech Solutions © {currentYear} All rights reserved
              </p>
            </motion.div>

            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex justify-center space-x-1.5 mt-6"
            >
              <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}