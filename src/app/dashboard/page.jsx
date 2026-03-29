// app/dashboard/page.jsx
'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardNavbar from '../../components/dashboard-components/Navbar';
import DashboardSidebar from '../../components/dashboard-components/Sidebar';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'next/navigation';
import DashboardHome from '../../components/dashboard-content/Home';
import Students from '../../components/dashboard-content/Students';
import Subjects from '../../components/dashboard-content/Subjects';
import Questions from '../../components/dashboard-content/Questions';
import Performance from '../../components/dashboard-content/Performance';
import Results from '../../components/dashboard-content/Results';
import Support from '../../components/dashboard-content/Support';
import Settings from '../../components/dashboard-content/Settings';
import Help from '../../components/dashboard-content/Help';
import Subscription from '../../components/dashboard-content/Subscription';
import Exams from '../../components/dashboard-content/Exams';
import SupportChat from '../../components/SupportChat';
import Feedback from '../../components/dashboard-content/Feedback';
import {
  dashboardContainer,
  dashboardMain,
  dashboardContent,
  dashboardInner,
  dashboardLoading,
  dashboardLoadingInner,
  dashboardLoadingSpinner,
  dashboardLoadingText,
} from '../../styles/styles';
import toast from 'react-hot-toast';

function DashboardContent() {
  // Default open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [pendingTicket, setPendingTicket] = useState(null);
  const { isAuthenticated, authChecked } = useAuth();
  const searchParams = useSearchParams();

  // Close sidebar by default on mobile
  useEffect(() => {
    const initSidebar = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    initSidebar();
  }, []);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      const timer = setTimeout(() => setPageLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [authChecked, isAuthenticated]);

  // Handle section from URL params
  useEffect(() => {
    const section = searchParams.get('section');
    const paymentRef = searchParams.get('payment_ref');
    if (section) {
      setActiveSection(section);
      if (section === 'subscription' && paymentRef) {
        toast.success('Payment completed successfully! Your subscription is now active.');
        const url = new URL(window.location.href);
        url.searchParams.delete('payment_ref');
        url.searchParams.delete('section');
        window.history.replaceState({}, '', url.pathname);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const ticketCreated = searchParams.get('ticketCreated');
    if (ticketCreated === 'true') {
      toast.success('Support ticket created successfully!');
      const url = new URL(window.location.href);
      url.searchParams.delete('ticketCreated');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleOpenChat = (event) => {
      if (event.detail) setPendingTicket(event.detail);
      setShowSupportChat(true);
    };
    window.addEventListener('openChatWithTicket', handleOpenChat);
    return () => window.removeEventListener('openChatWithTicket', handleOpenChat);
  }, []);

  const handleNavigation = (section) => {
    setActiveSection(section);
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleOpenChat = (ticketId = null) => {
    if (ticketId) setPendingTicket({ id: ticketId });
    setShowSupportChat(true);
  };

  const handleCloseChat = () => {
    setShowSupportChat(false);
    setPendingTicket(null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':         return <DashboardHome setActiveSection={handleNavigation} />;
      case 'students':    return <Students setActiveSection={handleNavigation} />;
      case 'subjects':    return <Subjects setActiveSection={handleNavigation} />;
      case 'questions':   return <Questions setActiveSection={handleNavigation} />;
      case 'performance': return <Performance setActiveSection={handleNavigation} />;
      case 'results':     return <Results setActiveSection={handleNavigation} />;
      case 'feedback':    return <Feedback setActiveSection={handleNavigation} />;
      case 'support':     return <Support setActiveSection={handleNavigation} onOpenChat={handleOpenChat} />;
      case 'settings':    return <Settings setActiveSection={handleNavigation} />;
      case 'help':        return <Help setActiveSection={handleNavigation} />;
      case 'subscription':return <Subscription setActiveSection={handleNavigation} />;
      case 'exams':       return <Exams setActiveSection={handleNavigation} />;
      default:            return <DashboardHome setActiveSection={handleNavigation} />;
    }
  };

  if (pageLoading) {
    return (
      <div className={dashboardLoading}>
        <div className={dashboardLoadingInner}>
          <div className={dashboardLoadingSpinner} />
          <p className={dashboardLoadingText}>Loading Einstein's CBT Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardContainer}>
      {/* Navbar — full width, sticky at top, z-50 */}
      <DashboardNavbar
        activeSection={activeSection}
        setActiveSection={handleNavigation}
        onMenuClick={() => setSidebarOpen(prev => !prev)}
        onSupportClick={() => setShowSupportChat(true)}
      />

      {/* Body row: sidebar + content */}
      <div className={dashboardMain}>
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          setActiveSection={handleNavigation}
          onSupportClick={() => setShowSupportChat(true)}
        />

        {/* Main content — shifts right on desktop when sidebar is open */}
        <main className={`${dashboardContent} transition-[margin-left] duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={dashboardInner}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <SupportChat
        isOpen={showSupportChat}
        onClose={handleCloseChat}
        initialTicket={pendingTicket}
      />
    </div>
  );
}

const LoadingFallback = () => (
  <div className={dashboardLoading}>
    <div className={dashboardLoadingInner}>
      <div className={dashboardLoadingSpinner} />
      <p className={dashboardLoadingText}>Loading Einstein's CBT Admin...</p>
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingFallback />}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
