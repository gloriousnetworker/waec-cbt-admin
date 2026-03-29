// components/dashboard-components/Sidebar.jsx
'use client';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Home,
  Users,
  BookOpen,
  HelpCircle,
  LogOut,
  X,
  PanelLeftClose,
  LayoutDashboard,
  FileQuestion,
  ClipboardList,
  BarChart3,
  TrendingUp,
  CreditCard,
  Ticket,
  Settings,
  Lightbulb,
  Headphones,
  MessageSquare,
} from 'lucide-react';
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
      { icon: LayoutDashboard, label: 'Dashboard',          id: 'home' },
      { icon: Users,           label: 'Student Management', id: 'students' },
      { icon: BookOpen,        label: 'Subject Management', id: 'subjects' },
      { icon: FileQuestion,    label: 'Question Bank',       id: 'questions' },
      { icon: ClipboardList,   label: 'Exam Setup',          id: 'exams' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { icon: BarChart3,  label: 'Performance',  id: 'performance' },
      { icon: TrendingUp, label: 'Exam Results', id: 'results' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { icon: CreditCard,    label: 'Subscription',    id: 'subscription' },
      { icon: MessageSquare, label: 'Student Feedback', id: 'feedback' },
      { icon: Ticket,        label: 'Support Tickets', id: 'support' },
      { icon: Settings,      label: 'Settings',        id: 'settings' },
      { icon: Lightbulb,     label: 'Help & Resources', id: 'help' },
    ],
  },
];

export default function DashboardSidebar({ isOpen, onClose, activeSection, setActiveSection, onSupportClick }) {
  const { logout, user } = useAuth();

  const handleMenuItemClick = (sectionId) => {
    setActiveSection(sectionId);
    // Close on mobile via CSS breakpoint — onClose handles this
    if (window.innerWidth < 1024) onClose();
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Mobile overlay — CSS lg:hidden handles desktop hiding */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={sidebarOverlay}
            aria-hidden="true"
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
        aria-label="Sidebar navigation"
        role="navigation"
      >
        {/* ── Header ── */}
        <div
          className="px-4 py-4 border-b border-white/10 flex-shrink-0"
          style={{ background: '#0D1220' }}
        >
          {/* Logo row + close button */}
          <div className={sidebarHeaderInner}>
            <div className={sidebarHeaderLogo}>
              <Image
                src="/logo.png"
                alt="Einstein's CBT App"
                width={36}
                height={36}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={sidebarHeaderTitle}>Einstein's CBT</h2>
              <p className={sidebarHeaderSubtitle}>Admin Portal</p>
            </div>
            {/* Close button — X on mobile, collapse icon on desktop */}
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close sidebar"
            >
              <span className="lg:hidden"><X size={17} strokeWidth={2} /></span>
              <span className="hidden lg:flex"><PanelLeftClose size={17} strokeWidth={2} /></span>
            </button>
          </div>

          {/* User profile card */}
          {user && (
            <div className="mt-3 flex items-center gap-2.5 px-3 py-2.5 bg-white/8 rounded-xl border border-white/10">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3A4F7A 0%, #1F2A49 100%)' }}
              >
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[11px] text-blue-300 truncate mt-0.5">
                  {user?.role === 'admin' ? 'School Admin' : user?.role || 'Administrator'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation groups ── */}
        <nav className={sidebarNav} aria-label="Dashboard sections">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={`${sidebarNavGroup} ${gi > 0 ? 'mt-2' : ''}`}>
              <p className={sidebarNavGroupLabel}>{group.label}</p>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-all duration-150 min-h-[44px]
                      cursor-pointer select-none mb-0.5
                      ${isActive
                        ? 'bg-brand-primary-lt text-brand-primary font-semibold'
                        : 'text-content-secondary hover:bg-surface-subtle hover:text-content-primary'
                      }
                    `}
                  >
                    {/* Left active border */}
                    {isActive && (
                      <motion.span
                        layoutId="activeBorder"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-primary rounded-r-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <Icon
                      size={17}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`flex-shrink-0 ${isActive ? 'text-brand-primary' : 'text-content-muted'}`}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>

                    {/* Active dot */}
                    {isActive && (
                      <motion.span
                        layoutId="activeDot"
                        className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className={`${sidebarFooter} pb-safe`}>
          <button onClick={() => logout()} className={sidebarLogout} aria-label="Sign out">
            <LogOut size={17} strokeWidth={2} className={sidebarLogoutIcon} />
            <span className={sidebarLogoutText}>Sign Out</span>
          </button>

          <div className={sidebarHelp}>
            <div className="flex items-center gap-2 mb-1.5">
              <Headphones size={13} className="text-brand-primary flex-shrink-0" />
              <p className={sidebarHelpTitle}>Need assistance?</p>
            </div>
            <button onClick={onSupportClick} className={sidebarHelpButton}>
              Contact Support →
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
