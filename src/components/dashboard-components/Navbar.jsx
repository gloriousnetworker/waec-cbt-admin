// components/dashboard-components/Navbar.jsx
'use client';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  navbarContainer,
  navbarInner,
  navbarContent,
  navbarLeft,
  navbarMenuButton,
  navbarLogo,
  navbarLogoImage,
  navbarLogoText,
  navbarLogoSubtext,
  navbarNav,
  navbarNavButton,
  navbarNavButtonActive,
  navbarNavButtonInactive,
  navbarRight,
  navbarSearch,
  navbarSearchIcon,
  navbarSearchInput,
  navbarNotification,
  navbarNotificationBadge,
  navbarProfileButton,
  navbarProfileAvatar,
  navbarProfileAvatarText,
  navbarProfileInfo,
  navbarProfileName,
  navbarProfileId,
  navbarDropdown,
  navbarDropdownHeader,
  navbarDropdownHeaderName,
  navbarDropdownHeaderEmail,
  navbarDropdownMenu,
  navbarDropdownItem,
  navbarDropdownItemDanger,
  modalOverlay,
  modalContainer,
  modalTitle,
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger,
} from '../../styles/styles';

// Proxy — same origin, no CORS issues
const BASE_URL = '';

const navSections = [
  { id: 'home',        label: 'Dashboard',   icon: '🏠' },
  { id: 'students',   label: 'Students',    icon: '👥' },
  { id: 'subjects',   label: 'Subjects',    icon: '📚' },
  { id: 'questions',  label: 'Questions',   icon: '❓' },
  { id: 'performance',label: 'Performance', icon: '📊' },
  { id: 'results',    label: 'Results',     icon: '📈' },
  { id: 'support',    label: 'Support',     icon: '🎫' },
];

export default function DashboardNavbar({ activeSection, setActiveSection, onMenuClick, onSupportClick }) {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [liveUser, setLiveUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setLiveUser(data.user);
        }
      } catch {}
    };
    fetchMe();
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const displayUser = liveUser || user;

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className={navbarContainer}>
        <div className={navbarInner}>
          <div className={navbarContent}>

            {/* ── Left: Hamburger + Logo ──────────────────────── */}
            <div className={navbarLeft}>
              {/* Hamburger — visible on ALL screen sizes per design system */}
              <button onClick={onMenuClick} className={navbarMenuButton} aria-label="Toggle menu">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className={navbarLogo}>
                <div className={navbarLogoImage}>
                  <Image
                    src="/logo.png"
                    alt="Einstein's CBT App"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className={navbarLogoText}>Einstein's CBT App</h1>
                  <p className={navbarLogoSubtext}>Admin Management Console</p>
                </div>
              </div>
            </div>

            {/* ── Centre: Active section breadcrumb (visible md+, replaces overcrowded tabs) ─── */}
            <div className="hidden md:flex items-center px-3 py-1.5 bg-brand-primary-lt rounded-lg">
              <span className="text-sm font-semibold text-brand-primary capitalize">
                {activeSection === 'home' ? 'Dashboard' :
                 activeSection === 'students' ? 'Student Management' :
                 activeSection === 'subjects' ? 'Subject Management' :
                 activeSection === 'questions' ? 'Question Bank' :
                 activeSection === 'exams' ? 'Exam Setup' :
                 activeSection === 'performance' ? 'Performance' :
                 activeSection === 'results' ? 'Exam Results' :
                 activeSection === 'support' ? 'Support Tickets' :
                 activeSection === 'subscription' ? 'Subscription' :
                 activeSection === 'settings' ? 'Settings' :
                 activeSection === 'help' ? 'Help & Resources' :
                 activeSection}
              </span>
            </div>

            {/* ── Right: Search + Bell + Profile ──────────────── */}
            <div className={navbarRight}>
              {/* Search */}
              <div className={navbarSearch}>
                <div className={navbarSearchIcon}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  className={navbarSearchInput}
                  placeholder="Search students, subjects..."
                />
              </div>

              {/* Notification bell */}
              <button className={navbarNotification} aria-label="Notifications">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className={navbarNotificationBadge} />
              </button>

              {/* Profile dropdown — state-controlled, no CSS visibility tricks */}
              <div className="profile-container relative">
                <button
                  onClick={() => setShowDropdown(prev => !prev)}
                  className={navbarProfileButton}
                  aria-label="Profile menu"
                  aria-expanded={showDropdown}
                >
                  <div className={navbarProfileAvatar}>
                    {/* Avatar — brand gradient, white initials */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
                    >
                      {getInitials(displayUser?.name)}
                    </div>
                  </div>
                  <div className={navbarProfileInfo}>
                    <p className={navbarProfileName}>{displayUser?.name || 'Admin'}</p>
                    <p className={navbarProfileId}>Administrator</p>
                  </div>
                  {/* Admin role badge */}
                  <span className="hidden xl:flex badge-admin text-xs ml-1">Admin</span>
                </button>

                {/* Dropdown — rendered via state only */}
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className={navbarDropdown}
                  >
                    <div className={navbarDropdownHeader}>
                      <p className={navbarDropdownHeaderName}>{displayUser?.name || 'Admin'}</p>
                      <p className={navbarDropdownHeaderEmail}>{displayUser?.email || ''}</p>
                    </div>
                    <div className={navbarDropdownMenu}>
                      <button
                        onClick={() => { setActiveSection('settings'); setShowDropdown(false); }}
                        className={navbarDropdownItem}
                      >
                        ⚙️ &nbsp;Settings
                      </button>
                      <button
                        onClick={() => { onSupportClick(); setShowDropdown(false); }}
                        className={navbarDropdownItem}
                      >
                        💬 &nbsp;Support Chat
                      </button>
                      <div className="h-px bg-border mx-2 my-1" />
                      <button
                        onClick={() => { setShowLogoutConfirm(true); setShowDropdown(false); }}
                        className={navbarDropdownItemDanger}
                      >
                        🚪 &nbsp;Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Logout confirmation modal ─────────────────────────── */}
      {showLogoutConfirm && (
        <div className={modalOverlay}>
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={modalContainer}
          >
            <h3 className={modalTitle}>Sign Out?</h3>
            <p className={modalText}>
              Are you sure you want to sign out of the Admin Portal?
            </p>
            <div className={modalActions}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={modalButtonSecondary}
              >
                Cancel
              </button>
              <button onClick={handleLogout} className={modalButtonDanger}>
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
