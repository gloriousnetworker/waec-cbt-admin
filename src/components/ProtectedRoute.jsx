// components/ProtectedRoute.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authChecked } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (authChecked && !isAuthenticated && !redirecting) {
      setRedirecting(true);
      router.replace('/login');
    }
  }, [isAuthenticated, authChecked, router, redirecting]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-primary-lt">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-brand-primary-lt border-t-brand-primary rounded-full mx-auto mb-4"
          />
          <p className="text-content-muted">Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}