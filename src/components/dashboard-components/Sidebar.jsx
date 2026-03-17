// components/dashboard-components/Sidebar.jsx
'use client';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  sidebarContainer,
  sidebarOverlay,
  sidebarHeaderInner,
  sidebarHeaderLogo,
  sidebarHeaderTitle,
  sidebarHeaderSubtitle,
  sidebarNav,
  sidebarNavGroup,
  sidebarNavGroupLabel,
  sidebarNavItem,
  sidebarNavItemActive,
  sidebarNavItemInactive,
  sidebarNavItemIcon,
  sidebarNavItemLabel,
  sidebarNavItemBadge,
  sidebarNavItemActiveBorder,
  sidebarFooter,
  sidebarLogout,
  sidebarLogoutIcon,
  sidebarLogoutText,
  sidebarHelp,
  sidebarHelpTitle,
  sidebarHelpButton,
} from '../../styles/styles';

const navGroups = [
  {
    label: 'MANAGEMENT',
    items: [
      { icon: '🏠', label: 'Dashboard',          id: 'home' },
      { icon: '👥', label: 'Student Management', id: 'students' },
      { icon: '📚', label: 'Subject Management', id: 'subjects' },
      { icon: '❓', label: 'Question Bank',       id: 'questions' },
      { icon: '📝', label: 'Exam Setup',          id: 'exams' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { icon: '📊', label: 'Performance',  id: 'performance' },
      { icon: '📈', label: 'Exam Results', id: 'results' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { icon: '💰', label: 'Subscription',    id: 'subscription' },
      { icon: '🎫', label: 'Support Tickets', id: 'support' },
      { icon: '⚙️', label: 'Settings',        id: 'settings' },
      { icon: '💡', label: 'Help & Resources', id: 'help' },
    ],
  },
];

export default function DashboardSidebar({ isOpen, onClose, activeSection, setActiveSection, onSupportClick }) {
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuItemClick = (sectionId) => {
    setActiveSection(sectionId);
    if (isMobile) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={sidebarOverlay}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={sidebarContainer}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        {/* ── Header — deep navy background ──────────────────── */}
        <div
          className="p-5 border-b border-white/10 flex-shrink-0"
          style={{ background: '#0D1220' }}
        >
          <div className={sidebarHeaderInner}>
            <div className={sidebarHeaderLogo}>
              <Image
                src="/logo.png"
                alt="Einstein's CBT App"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className={sidebarHeaderTitle}>Einstein's CBT App</h2>
              <p className={sidebarHeaderSubtitle}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* ── Navigation groups ───────────────────────────────── */}
        <nav className={sidebarNav}>
          {navGroups.map((group) => (
            <div key={group.label} className={sidebarNavGroup}>
              <p className={sidebarNavGroupLabel}>{group.label}</p>

              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`${sidebarNavItem} ${isActive ? sidebarNavItemActive : sidebarNavItemInactive}`}
                  >
                    {/* Left active border indicator */}
                    {isActive && (
                      <motion.span
                        layoutId="activeBorder"
                        className={sidebarNavItemActiveBorder}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <span className={sidebarNavItemIcon}>{item.icon}</span>
                    <span className={sidebarNavItemLabel}>{item.label}</span>

                    {/* Active dot badge */}
                    {isActive && (
                      <motion.span
                        layoutId="activeDot"
                        className={sidebarNavItemBadge}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className={sidebarFooter}>
          <button onClick={() => logout()} className={sidebarLogout}>
            <span className={sidebarLogoutIcon}>🚪</span>
            <span className={sidebarLogoutText}>Sign Out</span>
          </button>

          <div className={sidebarHelp}>
            <p className={sidebarHelpTitle}>Need assistance?</p>
            <button onClick={onSupportClick} className={sidebarHelpButton}>
              Contact Support →
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
