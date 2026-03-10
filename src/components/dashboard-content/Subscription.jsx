// components/dashboard-content/Subscription.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  examsContainer,
  examsHeader,
  examsTitle,
  examsSubtitle,
  modalOverlay,
  modalContainer,
  modalTitle,
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger
} from '../styles';

export default function Subscription({ setActiveSection }) {
  const { fetchWithAuth } = useAuth();
  const [plans, setPlans] = useState({});
  const [payments, setPayments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({ active: false });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchData();
    const urlParams = new URLSearchParams(window.location.search);
    const paymentRef = urlParams.get('payment_ref');
    if (paymentRef) {
      toast.success('Payment completed! Your subscription is being activated...');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, statusRes, paymentsRes, methodsRes] = await Promise.all([
        fetchWithAuth('/admin/subscription/plans'),
        fetchWithAuth('/admin/subscription/status'),
        fetchWithAuth('/admin/subscription/payments'),
        fetchWithAuth('/admin/payment/methods')
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.plans || {});
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSubscriptionStatus(statusData.status || { active: false });
        setCurrentSubscription(statusData.subscription);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.payments || []);
      }

      if (methodsRes.ok) {
        const methodsData = await methodsRes.json();
        setPaymentMethods(methodsData.methods || []);
      }
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePayment = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    const toastId = toast.loading('Initializing payment...');

    try {
      const response = await fetchWithAuth('/admin/subscription/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          plan: selectedPlan,
          paymentMethod: selectedMethod 
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment initialized! Redirecting...', { id: toastId });
        
        sessionStorage.setItem('pendingPayment', JSON.stringify({
          reference: data.payment.reference,
          plan: selectedPlan,
          amount: plans[selectedPlan]?.price
        }));
        
        window.location.href = data.payment.authorizationUrl;
      } else {
        toast.error(data.message || 'Failed to initialize payment', { id: toastId });
        setShowPaymentModal(false);
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
      setShowPaymentModal(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
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

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'failed': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPlanPeriod = (planKey, plan) => {
    if (!plan) return '';
    if (plan.days === 30) return '/month';
    if (plan.days === 120) return '/term';
    if (plan.days === 365) return '/year';
    return '';
  };

  const getPlanFeatures = (planKey, plan) => {
    const features = {
      monthly: [
        `✓ Up to ${plan.studentLimit || 50} students`,
        '✓ Basic analytics',
        '✓ Email support',
        '✓ Question bank access',
        '✓ Practice mode',
        '✗ Bulk import',
        '✗ Advanced exam scheduling',
        '✗ Custom branding'
      ],
      termly: [
        `✓ Up to ${plan.studentLimit || 200} students`,
        '✓ Advanced analytics',
        '✓ Priority support',
        '✓ Question bank access',
        '✓ Bulk import',
        '✓ Exam scheduling',
        '✓ Practice mode',
        '✗ Custom branding'
      ],
      yearly: [
        `✓ Up to ${plan.studentLimit || 500} students`,
        '✓ All analytics features',
        '✓ 24/7 priority support',
        '✓ Full question bank',
        '✓ Bulk import',
        '✓ Advanced exam scheduling',
        '✓ Custom branding',
        '✓ API access'
      ],
      unlimited: [
        `✓ Unlimited students for one year`,
        '✓ All analytics features',
        '✓ Dedicated support',
        '✓ Full question bank',
        '✓ Bulk import',
        '✓ Advanced exam scheduling',
        '✓ Custom branding',
        '✓ API access',
        '✓ White-label solution',
        '⭐ BEST VALUE'
      ]
    };
    return features[planKey] || [];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const planOrder = ['monthly', 'termly', 'yearly', 'unlimited'];

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Subscription Plans</h1>
        <p className={examsSubtitle}>Choose the best plan for your school</p>
      </div>

      {currentSubscription && subscriptionStatus.active && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="text-[16px] leading-[120%] font-[600] text-green-700 font-playfair">
                  Active Subscription: {subscriptionStatus.planName || currentSubscription.plan?.charAt(0).toUpperCase() + currentSubscription.plan?.slice(1)} Plan
                </h3>
                <p className="text-[13px] text-green-600 font-playfair mt-1">
                  Started: {formatDate(currentSubscription.startDate)} • 
                  Expires: {formatDate(currentSubscription.expiryDate)} • {subscriptionStatus.daysLeft || 0} days remaining
                </p>
                <p className="text-[12px] text-green-600 font-playfair mt-1">
                  Student Usage: {subscriptionStatus.studentCount || 0} / {subscriptionStatus.studentLimit === null ? '∞' : subscriptionStatus.studentLimit} students
                  {subscriptionStatus.remainingStudents !== null && subscriptionStatus.remainingStudents > 0 && (
                    <span className="ml-2 text-green-500">({subscriptionStatus.remainingStudents} slots left)</span>
                  )}
                </p>
                {currentSubscription.paymentReference && (
                  <p className="text-[11px] text-green-500 font-playfair mt-1">
                    Reference: {currentSubscription.paymentReference}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2 bg-white text-[#10b981] border border-[#10b981] rounded-lg hover:bg-[#F0FDF4] transition-colors text-sm font-[600]"
            >
              View Payment History
            </button>
          </div>
        </div>
      )}

      {!subscriptionStatus.active && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-[16px] leading-[120%] font-[600] text-yellow-700 font-playfair">
                No Active Subscription
              </h3>
              <p className="text-[13px] text-yellow-600 font-playfair mt-1">
                {subscriptionStatus.reason || 'Please activate a subscription to continue using all features'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {planOrder.map((key) => {
          const plan = plans[key];
          if (!plan) return null;
          
          const isCurrentPlan = currentSubscription?.plan === key && subscriptionStatus.active;
          const isUnlimited = key === 'unlimited';
          const period = getPlanPeriod(key, plan);
          
          return (
            <motion.div
              key={key}
              whileHover={{ y: -4 }}
              className={`bg-white rounded-xl border-2 p-6 relative ${
                isCurrentPlan
                  ? 'border-[#10b981] bg-[#F0FDF4]'
                  : isUnlimited
                  ? 'border-[#8B5CF6] hover:border-[#7C3AED]'
                  : 'border-gray-200 hover:border-[#10b981]'
              }`}
            >
              {isUnlimited && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#8B5CF6] text-white px-3 py-1 rounded-full text-[10px] font-[600]">
                  BEST VALUE
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="text-[20px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair">
                  {plan.name}
                </h3>
                <div className="mt-3">
                  <span className={`text-[32px] leading-[100%] font-[700] font-playfair ${
                    isUnlimited ? 'text-[#8B5CF6]' : 'text-[#10b981]'
                  }`}>
                    {formatCurrency(plan.price)}
                  </span>
                  {period && (
                    <span className="text-[12px] text-[#626060] font-playfair">{period}</span>
                  )}
                </div>
                {plan.studentLimit ? (
                  <p className="text-[13px] text-[#626060] mt-2 font-playfair">
                    Up to {plan.studentLimit} students
                  </p>
                ) : (
                  <p className="text-[13px] text-[#8B5CF6] mt-2 font-playfair font-[600]">
                    Unlimited students
                  </p>
                )}
                <p className="text-[11px] text-[#9CA3AF] mt-1 font-playfair">
                  {plan.description}
                </p>
                <p className="text-[10px] text-[#626060] mt-1 font-playfair">
                  {plan.days} days validity
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {getPlanFeatures(key, plan).map((benefit, index) => (
                  <div key={index} className={`flex items-center gap-2 text-[11px] font-playfair ${
                    benefit.includes('✗') ? 'text-[#9CA3AF]' : 'text-[#1E1E1E]'
                  }`}>
                    <span className={benefit.includes('✓') ? 'text-[#10b981]' : benefit.includes('⭐') ? 'text-[#8B5CF6] font-[600]' : 'text-[#9CA3AF]'}>
                      {benefit.includes('✓') ? '✓' : benefit.includes('✗') ? '✗' : ''}
                    </span>
                    <span>{benefit.replace(/[✓✗⭐]\s/, '')}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(key);
                  setShowPaymentModal(true);
                }}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-lg font-[600] text-[13px] leading-[100%] font-playfair transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isUnlimited
                    ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
                    : 'bg-[#10b981] text-white hover:bg-[#059669]'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-[18px] leading-[120%] font-[600] text-[#1E1E1E] mb-6 font-playfair">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">How do payments work?</h3>
            <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair">
              We use Paystack for secure payments. You'll be redirected to Paystack to complete your payment using card, bank transfer, or USSD.
            </p>
          </div>
          <div>
            <h3 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">Can I upgrade my plan?</h3>
            <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair">
              Yes, you can upgrade at any time. The remaining value will be prorated and applied to your new plan.
            </p>
          </div>
          <div>
            <h3 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">What happens when I reach my student limit?</h3>
            <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair">
              You won't be able to add more students until you upgrade to a higher plan or delete existing students.
            </p>
          </div>
          <div>
            <h3 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-2 font-playfair">Is there a refund policy?</h3>
            <p className="text-[12px] leading-[140%] font-[400] text-[#626060] font-playfair">
              We offer a 14-day money-back guarantee if you're not satisfied with our service.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Complete Payment</h3>
              
              <div className="mb-6">
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <p className="text-[12px] text-[#626060] mb-1 font-playfair">Selected Plan</p>
                  <p className="text-[16px] font-[600] text-[#1E1E1E] font-playfair">
                    {plans[selectedPlan]?.name} Plan
                  </p>
                  <p className="text-[20px] font-[700] text-[#10b981] font-playfair mt-2">
                    {formatCurrency(plans[selectedPlan]?.price)}
                  </p>
                  <p className="text-[11px] text-[#626060] mt-1">
                    {plans[selectedPlan]?.days} days validity
                  </p>
                  {plans[selectedPlan]?.studentLimit ? (
                    <p className="text-[12px] text-[#626060] mt-2">
                      Student Limit: {plans[selectedPlan].studentLimit} students
                    </p>
                  ) : (
                    <p className="text-[12px] text-[#8B5CF6] mt-2 font-[600]">
                      Unlimited students
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">
                    Payment Method
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.icon} {method.name} - {method.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={modalActions}>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitializePayment}
                  disabled={processing}
                  className={`px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={modalTitle}>Payment History</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {payments.length === 0 ? (
                  <p className="text-center text-[13px] text-[#626060] py-8">No payment history found</p>
                ) : (
                  payments.map((payment, index) => (
                    <motion.div
                      key={payment.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedPayment(selectedPayment?.id === payment.id ? null : payment)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[14px] font-[600] text-[#1E1E1E] font-playfair">
                              {payment.plan?.charAt(0).toUpperCase() + payment.plan?.slice(1)} Plan
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-[500] ${getStatusBadge(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#626060] font-playfair">
                            Reference: {payment.reference || 'N/A'}
                          </p>
                        </div>
                        <span className="text-[14px] font-[600] text-[#10b981]">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#626060] font-playfair">
                        <div>
                          <span className="font-[500]">Method:</span> {payment.paymentMethod}
                        </div>
                        <div>
                          <span className="font-[500]">Date:</span> {formatDateTime(payment.createdAt)}
                        </div>
                      </div>

                      {selectedPayment?.id === payment.id && payment.verificationData && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <h5 className="text-[12px] font-[600] text-[#1E1E1E] mb-2 font-playfair">Payment Details</h5>
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-[#626060]">Gateway Response:</span>
                              <span className="font-[500] text-[#10b981]">{payment.verificationData.gateway_response}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#626060]">Channel:</span>
                              <span>{payment.verificationData.channel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#626060]">Card Type:</span>
                              <span>{payment.verificationData.authorization?.card_type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#626060]">Last 4:</span>
                              <span>****{payment.verificationData.authorization?.last4}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#626060]">Bank:</span>
                              <span>{payment.verificationData.authorization?.bank}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#626060]">Paid At:</span>
                              <span>{formatDateTime(payment.verificationData.paid_at)}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              <div className={modalActions}>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className={modalButtonSecondary}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}