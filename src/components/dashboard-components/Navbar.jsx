'use client';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useNotifications } from '../../hooks/useNotifications';
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
  const { user, logout, fetchWithAuth } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [liveUser, setLiveUser] = useState(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);
  const { notifications, unreadCount, permissionState, requestPermission, markRead, markAllRead } = useNotifications(fetchWithAuth, '/admin', user?.id);

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

  useEffect(() => {
    if (!showNotifDropdown) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifDropdown]);

  const displayUser = liveUser || user;

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const formatNotifTime = (ts) => {
    if (!ts) return '';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
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
              <div ref={notifRef} className="relative">
                <button
                  className={navbarNotification}
                  aria-label="Notifications"
                  onClick={() => setShowNotifDropdown(prev => !prev)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-border shadow-card-lg z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <p className="text-sm font-bold text-content-primary">Notifications</p>
                      <div className="flex items-center gap-2">
                        {permissionState !== 'granted' && (
                          <button
                            onClick={requestPermission}
                            className="text-xs text-brand-primary hover:underline font-medium"
                          >
                            Enable push
                          </button>
                        )}
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-content-muted hover:text-brand-primary transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <p className="text-2xl mb-2">🔔</p>
                          <p className="text-xs text-content-muted">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => markRead(notif.id)}
                            className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-surface-subtle transition-colors ${!notif.read ? 'bg-brand-primary-lt/40' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              {!notif.read && (
                                <span className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-1.5" />
                              )}
                              <div className={`flex-1 min-w-0 ${notif.read ? 'pl-4' : ''}`}>
                                <p className="text-xs font-semibold text-content-primary truncate">{notif.title}</p>
                                <p className="text-xs text-content-muted mt-0.5 line-clamp-2">{notif.body}</p>
                                <p className="text-[10px] text-content-muted mt-1">{formatNotifTime(notif.createdAt)}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

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
