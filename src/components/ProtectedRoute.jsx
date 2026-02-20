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
    // Only redirect if auth is checked and user is not authenticated
    if (authChecked && !isAuthenticated && !redirecting) {
      setRedirecting(true);
      router.push('/login');
    }
  }, [isAuthenticated, authChecked, router, redirecting]);

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  // If not authenticated (should have redirected by now), show nothing
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, show the protected content
  return children;
}