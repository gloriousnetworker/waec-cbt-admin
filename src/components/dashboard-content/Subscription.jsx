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
  modalActions,
  modalButtonSecondary,
} from '../../styles/styles';

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
    if (urlParams.get('payment_ref')) {
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
        fetchWithAuth('/admin/payment/methods'),
      ]);
      if (plansRes.ok)    setPlans((await plansRes.json()).plans || {});
      if (statusRes.ok)   { const d = await statusRes.json(); setSubscriptionStatus(d.status || { active: false }); setCurrentSubscription(d.subscription); }
      if (paymentsRes.ok) setPayments((await paymentsRes.json()).payments || []);
      if (methodsRes.ok)  setPaymentMethods((await methodsRes.json()).methods || []);
    } catch { toast.error('Failed to load subscription data'); }
    finally { setLoading(false); }
  };

  const handleInitializePayment = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    const toastId = toast.loading('Initializing payment...');
    try {
      const response = await fetchWithAuth('/admin/subscription/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, paymentMethod: selectedMethod }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Payment initialized! Redirecting...', { id: toastId });
        sessionStorage.setItem('pendingPayment', JSON.stringify({ reference: data.payment.reference, plan: selectedPlan, amount: plans[selectedPlan]?.price }));
        window.location.href = data.payment.authorizationUrl;
      } else {
        toast.error(data.message || 'Failed to initialize payment', { id: toastId });
        setShowPaymentModal(false);
      }
    } catch { toast.error('Network error', { id: toastId }); setShowPaymentModal(false); }
    finally { setProcessing(false); }
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleDateString();
    return new Date(ts).toLocaleDateString();
  };

  const formatDateTime = (ts) => {
    if (!ts) return 'N/A';
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString();
    return new Date(ts).toLocaleString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-success-light text-success';
      case 'pending':   return 'bg-warning-light text-warning-dark';
      case 'failed':    return 'bg-danger-light text-danger';
      default:          return 'bg-surface-subtle text-content-secondary';
    }
  };

  const getPlanPeriod = (key, plan) => {
    if (!plan) return '';
    if (plan.days === 30)  return '/month';
    if (plan.days === 120) return '/term';
    if (plan.days === 365) return '/year';
    return '';
  };

  const getPlanFeatures = (key, plan) => {
    const f = {
      monthly:   [`Up to ${plan.studentLimit || 50} students`, 'Basic analytics', 'Email support', 'Question bank access', 'Practice mode'],
      termly:    [`Up to ${plan.studentLimit || 200} students`, 'Advanced analytics', 'Priority support', 'Question bank + bulk import', 'Exam scheduling'],
      yearly:    [`Up to ${plan.studentLimit || 500} students`, 'All analytics features', '24/7 priority support', 'Full question bank', 'Custom branding + API access'],
      unlimited: ['Unlimited students for one year', 'All analytics & features', 'Dedicated support', 'White-label solution', 'Full API access'],
    };
    return f[key] || [];
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm text-content-muted">Loading subscription data...</p>
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

      {/* ── Active subscription banner ── */}
      {currentSubscription && subscriptionStatus.active && (
        <div className="bg-success-light border border-success rounded-xl p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="text-sm font-bold text-success">
                  Active Subscription — {subscriptionStatus.planName || (currentSubscription.plan?.charAt(0).toUpperCase() + currentSubscription.plan?.slice(1))} Plan
                </h3>
                <p className="text-xs text-success mt-0.5">
                  Started: {formatDate(currentSubscription.startDate)} · Expires: {formatDate(currentSubscription.expiryDate)} · {subscriptionStatus.daysLeft || 0} days remaining
                </p>
                <p className="text-xs text-success mt-0.5">
                  Students: {subscriptionStatus.studentCount || 0} / {subscriptionStatus.studentLimit === null ? '∞' : subscriptionStatus.studentLimit}
                  {subscriptionStatus.remainingStudents > 0 && ` (${subscriptionStatus.remainingStudents} slots left)`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2 bg-white text-success border border-success rounded-lg hover:bg-success-light transition-colors text-sm font-semibold min-h-[40px] flex-shrink-0"
            >
              View Payment History
            </button>
          </div>
        </div>
      )}

      {/* ── Inactive banner ── */}
      {!subscriptionStatus.active && (
        <div className="bg-warning-light border border-warning rounded-xl p-5 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-sm font-bold text-warning-dark">No Active Subscription</h3>
              <p className="text-xs text-warning-dark mt-0.5 opacity-80">
                {subscriptionStatus.reason || 'Please activate a subscription to continue using all features'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {planOrder.map((key, i) => {
          const plan = plans[key];
          if (!plan) return null;

          const isCurrentPlan = currentSubscription?.plan === key && subscriptionStatus.active;
          const isUnlimited   = key === 'unlimited';
          const period        = getPlanPeriod(key, plan);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className={`bg-white rounded-xl border-2 p-6 relative flex flex-col transition-shadow hover:shadow-card-md ${
                isCurrentPlan ? 'border-brand-primary bg-brand-primary-lt'
                  : isUnlimited ? 'border-brand-gold'
                  : 'border-border hover:border-brand-primary'
              }`}
            >
              {/* Best Value badge */}
              {isUnlimited && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wide">
                  BEST VALUE
                </div>
              )}

              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-content-primary">{plan.name}</h3>
                <div className="mt-2">
                  <span className={`text-3xl font-bold ${isUnlimited ? 'text-brand-gold' : 'text-brand-primary'}`}>
                    {formatCurrency(plan.price)}
                  </span>
                  {period && <span className="text-xs text-content-muted ml-1">{period}</span>}
                </div>
                {plan.studentLimit ? (
                  <p className="text-xs text-content-muted mt-1.5">Up to {plan.studentLimit} students</p>
                ) : (
                  <p className="text-xs font-semibold text-brand-gold mt-1.5">Unlimited students</p>
                )}
                <p className="text-[10px] text-content-muted mt-1">{plan.days} days validity</p>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {getPlanFeatures(key, plan).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-content-secondary">
                    <span className={`mt-0.5 flex-shrink-0 ${isUnlimited ? 'text-brand-gold' : 'text-brand-primary'}`}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => { setSelectedPlan(key); setShowPaymentModal(true); }}
                disabled={isCurrentPlan}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[40px] ${
                  isCurrentPlan
                    ? 'bg-surface-muted text-content-muted cursor-not-allowed'
                    : isUnlimited
                    ? 'bg-brand-gold text-white hover:bg-warning-dark'
                    : 'bg-brand-primary text-white hover:bg-brand-primary-dk'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ── FAQ ── */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-content-primary mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: 'How do payments work?',               a: 'We use Paystack for secure payments. You\'ll be redirected to complete your payment using card, bank transfer, or USSD.' },
            { q: 'Can I upgrade my plan?',              a: 'Yes, you can upgrade at any time. The remaining value will be prorated and applied to your new plan.' },
            { q: 'What happens at my student limit?',   a: 'You won\'t be able to add more students until you upgrade your plan or remove existing students.' },
            { q: 'Is there a refund policy?',           a: 'We offer a 14-day money-back guarantee if you\'re not satisfied with our service.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <h3 className="text-sm font-bold text-content-primary mb-1.5">{q}</h3>
              <p className="text-sm text-content-muted leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {/* Payment modal */}
        {showPaymentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={modalOverlay} onClick={() => setShowPaymentModal(false)}
          >
            <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-card-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-content-primary mb-4">Complete Payment</h3>

              <div className="mb-5">
                <div className="p-4 bg-brand-primary-lt rounded-xl mb-4">
                  <p className="text-xs text-content-muted mb-1">Selected Plan</p>
                  <p className="text-base font-bold text-content-primary">{plans[selectedPlan]?.name} Plan</p>
                  <p className={`text-2xl font-bold mt-1 ${selectedPlan === 'unlimited' ? 'text-brand-gold' : 'text-brand-primary'}`}>
                    {formatCurrency(plans[selectedPlan]?.price)}
                  </p>
                  <p className="text-xs text-content-muted mt-1">{plans[selectedPlan]?.days} days validity</p>
                  {plans[selectedPlan]?.studentLimit ? (
                    <p className="text-xs text-content-secondary mt-1">Limit: {plans[selectedPlan].studentLimit} students</p>
                  ) : (
                    <p className="text-xs font-semibold text-brand-gold mt-1">Unlimited students</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wide">
                    Payment Method
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm text-content-primary bg-white"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>{m.icon} {m.name} — {m.description}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={modalActions}>
                <button onClick={() => setShowPaymentModal(false)} className={modalButtonSecondary}>Cancel</button>
                <button
                  onClick={handleInitializePayment}
                  disabled={processing}
                  className={`px-5 py-2.5 ${selectedPlan === 'unlimited' ? 'bg-brand-gold hover:bg-warning-dark' : 'bg-brand-primary hover:bg-brand-primary-dk'} text-white rounded-lg transition-colors text-sm font-semibold min-h-[40px] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Payment history modal */}
        {showHistoryModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={modalOverlay} onClick={() => setShowHistoryModal(false)}
          >
            <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-card-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-content-primary">Payment History</h3>
                <button onClick={() => setShowHistoryModal(false)} className="text-content-muted hover:text-content-primary text-xl leading-none">×</button>
              </div>

              <div className="space-y-3 mb-6">
                {payments.length === 0 ? (
                  <p className="text-center text-sm text-content-muted py-8">No payment history found</p>
                ) : (
                  payments.map((payment, index) => (
                    <motion.div
                      key={payment.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="border border-border rounded-xl p-4 hover:shadow-card transition-all cursor-pointer"
                      onClick={() => setSelectedPayment(selectedPayment?.id === payment.id ? null : payment)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-content-primary">
                              {payment.plan?.charAt(0).toUpperCase() + payment.plan?.slice(1)} Plan
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${getStatusBadge(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                          <p className="text-xs text-content-muted">Ref: {payment.reference || 'N/A'}</p>
                        </div>
                        <span className="text-sm font-bold text-brand-primary">{formatCurrency(payment.amount)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-content-muted">
                        <div><span className="font-medium">Method:</span> {payment.paymentMethod}</div>
                        <div><span className="font-medium">Date:</span> {formatDateTime(payment.createdAt)}</div>
                      </div>

                      {selectedPayment?.id === payment.id && payment.verificationData && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-border"
                        >
                          <p className="text-xs font-bold text-content-primary mb-2">Payment Details</p>
                          <div className="bg-surface-muted rounded-lg p-3 space-y-1.5 text-xs">
                            {[
                              ['Gateway Response', payment.verificationData.gateway_response],
                              ['Channel',          payment.verificationData.channel],
                              ['Card Type',        payment.verificationData.authorization?.card_type],
                              ['Last 4',           `****${payment.verificationData.authorization?.last4}`],
                              ['Bank',             payment.verificationData.authorization?.bank],
                              ['Paid At',          formatDateTime(payment.verificationData.paid_at)],
                            ].map(([label, value]) => (
                              <div key={label} className="flex justify-between">
                                <span className="text-content-muted">{label}:</span>
                                <span className="text-content-primary font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              <div className={modalActions}>
                <button onClick={() => setShowHistoryModal(false)} className={modalButtonSecondary}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
