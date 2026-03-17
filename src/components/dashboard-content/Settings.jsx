// components/dashboard-content/Settings.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ProtectedRoute from '../ProtectedRoute';

// Shared input class
const inputCls = 'w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm text-content-primary bg-white disabled:bg-surface-muted disabled:text-content-muted transition-all';
const labelCls = 'block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wide';
const cardCls  = 'bg-white rounded-xl border border-border shadow-card p-6';
const btnPrimary = 'px-5 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-colors text-sm font-semibold min-h-[40px] disabled:opacity-50';
const btnSecondary = 'px-4 py-2.5 border border-border rounded-lg hover:bg-surface-subtle text-sm font-medium text-content-secondary transition-colors min-h-[40px]';

// Toggle switch
const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary" />
  </label>
);

function SettingsContent() {
  const { user, updateUser, fetchWithAuth, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [twoFAQRCode, setTwoFAQRCode] = useState('');
  const [twoFAToken, setTwoFAToken] = useState(['', '', '', '', '', '']);
  const [loading2FA, setLoading2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({ name: '', email: '', role: '', school: '', phone: '', address: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [notificationSettings, setNotificationSettings] = useState({ notifications: true, examReminders: true, studyReminders: true });
  const [examSettings, setExamSettings] = useState({ autoSave: true, timerSound: true, tabWarning: true });
  const [appearanceSettings, setAppearanceSettings] = useState({ darkMode: false, theme: 'navy' });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '', email: user.email || '', role: user.role || 'Administrator',
        school: user.school || '', phone: user.phone || '', address: user.address || '',
      });
    }
  }, [user]);

  const tabs = [
    { id: 'profile',       label: 'Profile',        icon: '👤' },
    { id: 'security',      label: 'Security',        icon: '🔒' },
    { id: 'notifications', label: 'Notifications',   icon: '🔔' },
    { id: 'exam',          label: 'Exam Settings',   icon: '📝' },
    { id: 'appearance',    label: 'Appearance',      icon: '🎨' },
  ];

  const handleProfileUpdate = async () => {
    setLoading(true);
    const toastId = toast.loading('Updating profile...');
    try {
      const response = await fetchWithAuth('/admin/profile', { method: 'PUT', body: JSON.stringify(profileData) });
      const data = await response.json();
      if (response.ok) {
        updateUser(profileData);
        setIsEditing(false);
        toast.success('Profile updated successfully!', { id: toastId });
        await refreshUser();
      } else {
        toast.error(data.message || 'Failed to update profile', { id: toastId });
      }
    } catch { toast.error('Network error', { id: toastId }); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) { toast.error('New passwords do not match'); return; }
    if (passwordData.new.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const toastId = toast.loading('Changing password...');
    try {
      const response = await fetchWithAuth('/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Password changed successfully!', { id: toastId });
        setShowPasswordModal(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        toast.error(data.message || 'Failed to change password', { id: toastId });
      }
    } catch { toast.error('Network error', { id: toastId }); }
    finally { setLoading(false); }
  };

  const handleSetup2FA = async () => {
    setLoading2FA(true);
    const toastId = toast.loading('Setting up 2FA...');
    try {
      const response = await fetchWithAuth('/auth/setup-2fa', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setTwoFAQRCode(data.qrCode);
        setShow2FAModal(true);
        toast.success('Scan the QR code with Google Authenticator', { id: toastId });
      } else {
        toast.error(data.message || 'Failed to setup 2FA', { id: toastId });
      }
    } catch { toast.error('Network error', { id: toastId }); }
    finally { setLoading2FA(false); }
  };

  const handleVerify2FA = async () => {
    const token = twoFAToken.join('');
    if (token.length !== 6) { toast.error('Please enter complete 6-digit code'); return; }
    const toastId = toast.loading('Verifying...');
    try {
      const response = await fetchWithAuth('/auth/verify-2fa-setup', { method: 'POST', body: JSON.stringify({ token }) });
      const data = await response.json();
      if (response.ok) {
        toast.success('2FA enabled successfully', { id: toastId });
        setShow2FAModal(false);
        setTwoFAToken(['', '', '', '', '', '']);
        await refreshUser();
      } else {
        toast.error(data.message || 'Invalid code', { id: toastId });
        setTwoFAToken(['', '', '', '', '', '']);
      }
    } catch { toast.error('Verification failed', { id: toastId }); }
  };

  const handleDisable2FA = async () => {
    const toastId = toast.loading('Disabling 2FA...');
    try {
      const response = await fetchWithAuth('/auth/disable-2fa', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        toast.success('2FA disabled successfully', { id: toastId });
        setShowDisable2FAModal(false);
        await refreshUser();
      } else {
        toast.error(data.message || 'Failed to disable 2FA', { id: toastId });
      }
    } catch { toast.error('Network error', { id: toastId }); }
  };

  const handle2FAChange = (index, value) => {
    if (isNaN(value)) return;
    const newToken = [...twoFAToken];
    newToken[index] = value.slice(-1);
    setTwoFAToken(newToken);
    if (value && index < 5) document.getElementById(`2fa-${index + 1}`)?.focus();
  };

  const handle2FAKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !twoFAToken[index] && index > 0) document.getElementById(`2fa-${index - 1}`)?.focus();
  };

  const saveSettings = async (endpoint, data, label) => {
    const toastId = toast.loading(`Saving ${label}...`);
    try {
      const response = await fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(data) });
      if (response.ok) toast.success(`${label} saved!`, { id: toastId });
      else toast.error(`Failed to save ${label}`, { id: toastId });
    } catch { toast.error('Network error', { id: toastId }); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    const toastId = toast.loading('Deleting account...');
    try {
      const response = await fetchWithAuth('/auth/delete-account', { method: 'DELETE' });
      if (response.ok) {
        toast.success('Account deleted', { id: toastId });
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      } else {
        toast.error('Failed to delete account', { id: toastId });
      }
    } catch { toast.error('Network error', { id: toastId }); }
  };

  const initials = profileData.name
    ? profileData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  const tabContent = {
    // ── Profile ─────────────────────────────────────────────────────────────
    profile: (
      <div className={cardCls}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h2 className="text-lg font-bold text-content-primary">Profile Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary-lt transition-colors text-sm font-semibold min-h-[38px]"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-base font-bold text-content-primary">{profileData.name}</p>
            <p className="text-sm text-content-secondary mt-0.5">{profileData.role}</p>
            <p className="text-xs text-content-muted mt-0.5">{profileData.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name',     key: 'name',    type: 'text' },
            { label: 'Email Address', key: 'email',   type: 'email' },
            { label: 'Phone Number',  key: 'phone',   type: 'text' },
            { label: 'School',        key: 'school',  type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <input
                type={type}
                value={profileData[key]}
                onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })}
                disabled={!isEditing}
                className={inputCls}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className={labelCls}>Address</label>
            <textarea
              rows={2}
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              disabled={!isEditing}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button onClick={() => setIsEditing(false)} className={btnSecondary}>Cancel</button>
            <button onClick={handleProfileUpdate} disabled={loading} className={btnPrimary}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    ),

    // ── Security ─────────────────────────────────────────────────────────────
    security: (
      <div className={cardCls}>
        <h2 className="text-lg font-bold text-content-primary mb-6">Security Settings</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Password',
              desc: 'Change your password regularly for account safety',
              action: (
                <button onClick={() => setShowPasswordModal(true)} className={btnPrimary}>
                  Change Password
                </button>
              ),
            },
            {
              title: 'Two-Factor Authentication',
              desc: user?.twoFactorEnabled ? '2FA is currently enabled on your account' : 'Add an extra layer of security to your account',
              action: user?.twoFactorEnabled ? (
                <button onClick={() => setShowDisable2FAModal(true)} className="px-4 py-2.5 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors text-sm font-semibold min-h-[40px]">
                  Disable 2FA
                </button>
              ) : (
                <button onClick={handleSetup2FA} disabled={loading2FA} className={btnPrimary}>
                  {loading2FA ? 'Setting up...' : 'Enable 2FA'}
                </button>
              ),
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-brand-primary-lt rounded-xl">
              <div>
                <p className="text-sm font-bold text-content-primary">{item.title}</p>
                <p className="text-xs text-content-muted mt-0.5">{item.desc}</p>
              </div>
              {item.action}
            </div>
          ))}
        </div>
      </div>
    ),

    // ── Notifications ────────────────────────────────────────────────────────
    notifications: (
      <div className={cardCls}>
        <h2 className="text-lg font-bold text-content-primary mb-6">Notification Settings</h2>
        <div className="space-y-3 mb-6">
          {[
            { key: 'notifications', label: 'Enable Notifications',   desc: 'Receive in-app notifications' },
            { key: 'examReminders', label: 'Exam Reminders',          desc: 'Remind me before scheduled exams' },
            { key: 'studyReminders',label: 'Study Reminders',         desc: 'Daily study session reminders' },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <p className="text-sm font-semibold text-content-primary">{s.label}</p>
                <p className="text-xs text-content-muted mt-0.5">{s.desc}</p>
              </div>
              <Toggle
                checked={notificationSettings[s.key]}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, [s.key]: e.target.checked })}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={() => saveSettings('/settings/notifications', notificationSettings, 'Notification settings')} className={btnPrimary}>
            Save Notification Settings
          </button>
        </div>
      </div>
    ),

    // ── Exam Settings ────────────────────────────────────────────────────────
    exam: (
      <div className={cardCls}>
        <h2 className="text-lg font-bold text-content-primary mb-6">Exam Settings</h2>
        <div className="space-y-3 mb-6">
          {[
            { key: 'autoSave',    label: 'Auto-save Progress',    desc: 'Automatically save exam progress every minute' },
            { key: 'timerSound',  label: 'Timer Sound',            desc: 'Play sound when time is running low' },
            { key: 'tabWarning',  label: 'Tab Switch Warning',     desc: 'Warn when switching browser tabs during exams' },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <p className="text-sm font-semibold text-content-primary">{s.label}</p>
                <p className="text-xs text-content-muted mt-0.5">{s.desc}</p>
              </div>
              <Toggle
                checked={examSettings[s.key]}
                onChange={(e) => setExamSettings({ ...examSettings, [s.key]: e.target.checked })}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={() => saveSettings('/settings/exam', examSettings, 'Exam settings')} className={btnPrimary}>
            Save Exam Settings
          </button>
        </div>
      </div>
    ),

    // ── Appearance ───────────────────────────────────────────────────────────
    appearance: (
      <div className={cardCls}>
        <h2 className="text-lg font-bold text-content-primary mb-6">Appearance</h2>

        <div className="flex items-center justify-between p-4 border border-border rounded-xl mb-6">
          <div>
            <p className="text-sm font-semibold text-content-primary">Dark Mode</p>
            <p className="text-xs text-content-muted mt-0.5">Switch to dark theme (coming soon)</p>
          </div>
          <Toggle
            checked={appearanceSettings.darkMode}
            onChange={(e) => setAppearanceSettings({ ...appearanceSettings, darkMode: e.target.checked })}
          />
        </div>

        <p className={`${labelCls} mb-3`}>Colour Theme</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { key: 'navy',   label: 'Navy',   from: '#1F2A49', to: '#3A4F7A' },
            { key: 'blue',   label: 'Blue',   from: '#3b82f6', to: '#60a5fa' },
            { key: 'purple', label: 'Purple', from: '#8b5cf6', to: '#a78bfa' },
            { key: 'orange', label: 'Orange', from: '#f97316', to: '#fb923c' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: t.key })}
              className={`p-3 rounded-xl border-2 transition-all ${
                appearanceSettings.theme === t.key
                  ? 'border-brand-primary shadow-brand'
                  : 'border-border hover:border-border-strong'
              }`}
            >
              <div className="h-8 rounded-lg mb-2" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} />
              <p className="text-xs font-medium text-content-primary">{t.label} Theme</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={() => saveSettings('/settings/appearance', appearanceSettings, 'Appearance settings')} className={btnPrimary}>
            Save Appearance
          </button>
        </div>
      </div>
    ),
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary">Settings</h1>
        <p className="text-sm text-content-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* ── Layout: sidebar tabs + content ── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Tab sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-primary-lt text-brand-primary border-l-4 border-brand-primary font-semibold'
                    : 'hover:bg-surface-subtle text-content-secondary border-l-4 border-transparent'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content with AnimatePresence */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="mt-8 bg-danger-light border border-danger rounded-xl p-6">
        <h3 className="text-base font-bold text-danger mb-3">⚠️ Danger Zone</h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-danger">Delete Account</p>
            <p className="text-xs text-danger mt-0.5 opacity-80">Permanently delete your account and all associated data</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 border border-danger text-danger font-semibold rounded-lg hover:bg-danger hover:text-white transition-all text-sm min-h-[40px]"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {/* Change Password */}
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-card-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-content-primary mb-4">Change Password</h3>
              <div className="space-y-4 mb-6">
                {[
                  { label: 'Current Password',     key: 'current'  },
                  { label: 'New Password',          key: 'new'      },
                  { label: 'Confirm New Password',  key: 'confirm'  },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input
                      type="password"
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowPasswordModal(false)} className={btnSecondary}>Cancel</button>
                <button onClick={handlePasswordChange} disabled={loading} className={btnPrimary}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Setup 2FA */}
        {show2FAModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-card-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-content-primary mb-2">Setup Two-Factor Authentication</h3>
              <p className="text-sm text-content-muted mb-5">
                Scan this QR code with Google Authenticator or Authy.
              </p>
              {twoFAQRCode && (
                <div className="flex justify-center mb-5">
                  <img src={twoFAQRCode} alt="2FA QR Code" className="w-48 h-48 rounded-lg border border-border" />
                </div>
              )}
              <div className="mb-6">
                <label className={labelCls}>Enter 6-digit code from authenticator</label>
                <div className="flex gap-2 justify-center mt-2">
                  {twoFAToken.map((digit, index) => (
                    <input
                      key={index}
                      id={`2fa-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handle2FAChange(index, e.target.value)}
                      onKeyDown={(e) => handle2FAKeyDown(index, e)}
                      maxLength={1}
                      className="w-12 h-12 text-center border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-lg font-bold text-content-primary"
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShow2FAModal(false); setTwoFAToken(['','','','','','']); }} className={btnSecondary}>
                  Cancel
                </button>
                <button onClick={handleVerify2FA} className={btnPrimary}>Verify & Enable</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Disable 2FA */}
        {showDisable2FAModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-card-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-content-primary mb-2">Disable Two-Factor Authentication</h3>
              <p className="text-sm text-content-muted mb-6">
                Are you sure? This will make your account less secure.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDisable2FAModal(false)} className={btnSecondary}>Cancel</button>
                <button onClick={handleDisable2FA} className="px-5 py-2.5 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors text-sm font-semibold min-h-[40px]">
                  Disable 2FA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
