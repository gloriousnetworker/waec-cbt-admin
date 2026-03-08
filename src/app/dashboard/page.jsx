// app/dashboard/page.jsx (updated with section param handling)
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
import toast from 'react-hot-toast';

const dashboardContainer = "min-h-screen bg-[#F9FAFB]";
const dashboardMain = "flex";
const dashboardContent = "flex-1 min-h-screen overflow-y-auto";
const dashboardInner = "max-w-7xl mx-auto px-4 py-6";
const dashboardLoading = "fixed inset-0 bg-white flex items-center justify-center z-50";
const dashboardLoadingInner = "text-center";
const dashboardLoadingSpinner = "w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4";
const dashboardLoadingText = "text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair";

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [pendingTicket, setPendingTicket] = useState(null);
  const { isAuthenticated, authChecked } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authChecked, isAuthenticated]);

  // Handle section from URL params
  useEffect(() => {
    const section = searchParams.get('section');
    const paymentRef = searchParams.get('payment_ref');
    
    if (section) {
      setActiveSection(section);
      
      // Show success message if coming from payment
      if (section === 'subscription' && paymentRef) {
        toast.success('Payment completed successfully! Your subscription is now active.');
        
        // Clean up URL
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
      if (event.detail) {
        setPendingTicket(event.detail);
      }
      setShowSupportChat(true);
    };

    window.addEventListener('openChatWithTicket', handleOpenChat);
    return () => window.removeEventListener('openChatWithTicket', handleOpenChat);
  }, []);

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const handleOpenChat = (ticketId = null) => {
    if (ticketId) {
      const ticket = { id: ticketId };
      setPendingTicket(ticket);
    }
    setShowSupportChat(true);
  };

  const handleCloseChat = () => {
    setShowSupportChat(false);
    setPendingTicket(null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <DashboardHome setActiveSection={handleNavigation} />;
      case 'students': return <Students setActiveSection={handleNavigation} />;
      case 'subjects': return <Subjects setActiveSection={handleNavigation} />;
      case 'questions': return <Questions setActiveSection={handleNavigation} />;
      case 'performance': return <Performance setActiveSection={handleNavigation} />;
      case 'results': return <Results setActiveSection={handleNavigation} />;
      case 'support': return <Support setActiveSection={handleNavigation} onOpenChat={handleOpenChat} />;
      case 'settings': return <Settings setActiveSection={handleNavigation} />;
      case 'help': return <Help setActiveSection={handleNavigation} />;
      case 'subscription': return <Subscription setActiveSection={handleNavigation} />;
      case 'exams': return <Exams setActiveSection={handleNavigation} />;
      default: return <DashboardHome setActiveSection={handleNavigation} />;
    }
  };

  if (pageLoading) {
    return (
      <div className={dashboardLoading}>
        <div className={dashboardLoadingInner}>
          <div className={dashboardLoadingSpinner}></div>
          <p className={dashboardLoadingText}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardContainer}>
      <DashboardNavbar 
        activeSection={activeSection}
        setActiveSection={handleNavigation}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        onSupportClick={() => setShowSupportChat(true)}
      />
      
      <div className={dashboardMain}>
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          setActiveSection={handleNavigation}
          onSupportClick={() => setShowSupportChat(true)}
        />
        
        <main className={dashboardContent}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={dashboardInner}
          >
            {renderSection()}
          </motion.div>
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className={dashboardLoading}>
          <div className={dashboardLoadingInner}>
            <div className={dashboardLoadingSpinner}></div>
            <p className={dashboardLoadingText}>Loading admin dashboard...</p>
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}