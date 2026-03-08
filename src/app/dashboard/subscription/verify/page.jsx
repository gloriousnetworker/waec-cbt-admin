// app/dashboard/subscription/verify/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function VerifyPayment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');
  const refToUse = reference || trxref;

  useEffect(() => {
    if (!refToUse) {
      router.push('/dashboard/subscription');
      return;
    }

    // Check for pending payment in sessionStorage
    const pendingPayment = sessionStorage.getItem('pendingPayment');
    if (pendingPayment) {
      try {
        const pending = JSON.parse(pendingPayment);
        if (pending.reference === refToUse) {
          console.log('Found pending payment:', pending);
        }
      } catch (e) {
        console.error('Error parsing pending payment:', e);
      }
    }

    verifyPayment(refToUse);
  }, []);

  const verifyPayment = async (ref) => {
    try {
      const response = await fetchWithAuth(`/admin/subscription/verify/${ref}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setPaymentDetails(data.subscription || data.payment);
        toast.success('Payment verified successfully!');
        
        // Clear pending payment from sessionStorage
        sessionStorage.removeItem('pendingPayment');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/dashboard/subscription?payment_ref=' + ref);
        }, 3000);
      } else {
        setStatus('failed');
        setError(data.message || 'Payment verification failed');
        toast.error(data.message || 'Payment verification failed');
      }
    } catch (error) {
      setStatus('failed');
      setError('Failed to verify payment. Please check your connection and try again.');
      toast.error('Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = () => {
    if (refToUse) {
      setVerifying(true);
      setStatus(null);
      verifyPayment(refToUse);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center"
      >
        {verifying ? (
          <>
            <div className="w-16 h-16 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-[20px] font-[600] text-[#1E1E1E] mb-2 font-playfair">
              Verifying Payment
            </h2>
            <p className="text-[14px] text-[#626060] font-playfair mb-2">
              Reference: {refToUse}
            </p>
            <p className="text-[12px] text-[#9CA3AF] font-playfair">
              Please wait while we verify your payment...
            </p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="text-6xl mb-4 bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              ✅
            </div>
            <h2 className="text-[24px] font-[700] text-[#1E1E1E] mb-2 font-playfair">
              Payment Successful!
            </h2>
            <p className="text-[14px] text-[#626060] font-playfair mb-4">
              Your subscription has been activated successfully.
            </p>
            
            {paymentDetails && (
              <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-[12px] text-green-700 font-playfair mb-1">
                  <span className="font-[600]">Plan:</span> {paymentDetails.plan?.charAt(0).toUpperCase() + paymentDetails.plan?.slice(1)}
                </p>
                <p className="text-[12px] text-green-700 font-playfair mb-1">
                  <span className="font-[600]">Amount:</span> ₦{paymentDetails.amount?.toLocaleString()}
                </p>
                <p className="text-[12px] text-green-700 font-playfair">
                  <span className="font-[600]">Expires:</span> {formatDate(paymentDetails.expiryDate)}
                </p>
              </div>
            )}
            
            <p className="text-[12px] text-[#9CA3AF] font-playfair mb-4">
              Redirecting you back to subscription page...
            </p>
            
            <button
              onClick={() => router.push('/dashboard/subscription')}
              className="px-6 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors font-playfair w-full"
            >
              Go to Subscription
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              ❌
            </div>
            <h2 className="text-[24px] font-[700] text-[#1E1E1E] mb-2 font-playfair">
              Payment Failed
            </h2>
            <p className="text-[14px] text-[#626060] font-playfair mb-4">
              {error || "We couldn't verify your payment."}
            </p>
            
            <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-[12px] text-yellow-700 font-playfair mb-2">
                <span className="font-[600]">Reference:</span> {refToUse}
              </p>
              <p className="text-[12px] text-yellow-700 font-playfair">
                If you've already made the payment, it may take a few minutes to process. 
                Please check your email for confirmation or try again.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors font-playfair"
              >
                Retry Verification
              </button>
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-playfair"
              >
                Back to Subscription
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}