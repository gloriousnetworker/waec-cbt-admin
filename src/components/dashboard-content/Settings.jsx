// components/settings/Settings.jsx
'use client';

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import ProtectedRoute from '../ProtectedRoute'

function SettingsContent() {
  const { user, updateUser, fetchWithAuth, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false)
  const [twoFASecret, setTwoFASecret] = useState('')
  const [twoFAQRCode, setTwoFAQRCode] = useState('')
  const [twoFAToken, setTwoFAToken] = useState(['', '', '', '', '', ''])
  const [loading2FA, setLoading2FA] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    school: '',
    phone: '+234 800 123 4567',
    address: 'Kogi State College of Education'
  })

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    notifications: true,
    examReminders: true,
    studyReminders: true
  })

  const [examSettings, setExamSettings] = useState({
    autoSave: true,
    timerSound: true,
    tabWarning: true
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    theme: 'green'
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || 'Admin User',
        email: user.email || 'admin@kogistatecollege.edu.ng',
        role: user.role || 'Administrator',
        school: user.school || 'Kogi State College of Education',
        phone: user.phone || '+234 800 123 4567',
        address: user.address || 'Kogi State College of Education'
      })
    }
  }, [user])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'exam', label: 'Exam Settings', icon: '📝' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
  ]

  const handleProfileUpdate = async () => {
    setLoading(true)
    const toastId = toast.loading('Updating profile...')
    try {
      const response = await fetchWithAuth('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        updateUser(profileData)
        setIsEditing(false)
        toast.success('Profile updated successfully!', { id: toastId })
        await refreshUser()
      } else {
        toast.error(data.message || 'Failed to update profile', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    const toastId = toast.loading('Changing password...')
    
    try {
      const response = await fetchWithAuth('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Password changed successfully!', { id: toastId })
        setShowPasswordModal(false)
        setPasswordData({ current: '', new: '', confirm: '' })
      } else {
        toast.error(data.message || 'Failed to change password', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    setLoading2FA(true)
    const toastId = toast.loading('Setting up 2FA...')
    try {
      const response = await fetchWithAuth('/auth/setup-2fa', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTwoFASecret(data.secret)
        setTwoFAQRCode(data.qrCode)
        setShow2FAModal(true)
        toast.success('Scan the QR code with Google Authenticator', { id: toastId })
      } else {
        toast.error(data.message || 'Failed to setup 2FA', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error', { id: toastId })
    } finally {
      setLoading2FA(false)
    }
  }

  const handleVerify2FA = async () => {
    const token = twoFAToken.join('')
    if (token.length !== 6) {
      toast.error('Please enter complete 6-digit code')
      return
    }

    const toastId = toast.loading('Verifying...')
    try {
      const response = await fetchWithAuth('/auth/verify-2fa-setup', {
        method: 'POST',
        body: JSON.stringify({ token })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('2FA enabled successfully', { id: toastId })
        setShow2FAModal(false)
        setTwoFAToken(['', '', '', '', '', ''])
        await refreshUser()
      } else {
        toast.error(data.message || 'Invalid code', { id: toastId })
        setTwoFAToken(['', '', '', '', '', ''])
      }
    } catch (error) {
      toast.error('Verification failed', { id: toastId })
    }
  }

  const handleDisable2FA = async () => {
    const toastId = toast.loading('Disabling 2FA...')
    try {
      const response = await fetchWithAuth('/auth/disable-2fa', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('2FA disabled successfully', { id: toastId })
        setShowDisable2FAModal(false)
        await refreshUser()
      } else {
        toast.error(data.message || 'Failed to disable 2FA', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error', { id: toastId })
    }
  }

  const handle2FAChange = (index, value) => {
    if (isNaN(value)) return
    const newToken = [...twoFAToken]
    newToken[index] = value.slice(-1)
    setTwoFAToken(newToken)
    if (value && index < 5) {
      const nextInput = document.getElementById(`2fa-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handle2FAKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !twoFAToken[index] && index > 0) {
      const prevInput = document.getElementById(`2fa-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const saveNotificationSettings = async () => {
    const toastId = toast.loading('Saving notification settings...')
    try {
      const response = await fetchWithAuth('/settings/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationSettings)
      })
      
      if (response.ok) {
        toast.success('Notification settings saved!', { id: toastId })
      } else {
        toast.error('Failed to save settings', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error', { id: toastId })
    }
  }

  const saveExamSettings = async () => {
    const toastId = toast.loading('Saving exam settings...')
    try {
      const response = await fetchWithAuth('/settings/exam', {
        method: 'POST',
        body: JSON.stringify(examSettings)
      })
      
      if (response.ok) {
        toast.success('Exam settings saved!', { id: toastId })
      } else {
        toast.error('Failed to save settings', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error', { id: toastId })
    }
  }

  const saveAppearanceSettings = async () => {
    const toastId = toast.loading('Saving appearance settings...')
    try {
      const response = await fetchWithAuth('/settings/appearance', {
        method: 'POST',
        body: JSON.stringify(appearanceSettings)
      })
      
      if (response.ok) {
        toast.success('Appearance settings saved!', { id: toastId })
      } else {
        toast.error('Failed to save settings', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error', { id: toastId })
    }
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.')
    if (!confirmDelete) return

    const toastId = toast.loading('Deleting account...')
    try {
      const response = await fetchWithAuth('/auth/delete-account', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Account deleted', { id: toastId })
        setTimeout(() => { window.location.href = '/login' }, 2000)
      } else {
        toast.error('Failed to delete account', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error', { id: toastId })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E1E1E] font-playfair">Settings</h1>
        <p className="text-sm text-[#626060] font-playfair">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#F0FDF4] text-[#10b981] border-l-4 border-[#10b981]'
                    : 'hover:bg-gray-50 text-[#626060]'
                }`}
              >
                <span className="text-[18px]">{tab.icon}</span>
                <span className="text-[13px] leading-[100%] font-[500] font-playfair">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[#1E1E1E] font-playfair">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-[#10b981] border border-[#10b981] rounded-md hover:bg-[#F0FDF4] transition-colors text-[12px] leading-[100%] font-[500] font-playfair"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-[#10b981] flex items-center justify-center text-white text-[24px] leading-[100%] font-[600]">
                  {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div>
                  <h3 className="text-[18px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">{profileData.name}</h3>
                  <p className="text-[13px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">{profileData.role}</p>
                  <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">{profileData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-2 font-playfair">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>
                <div>
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-2 font-playfair">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>
                <div>
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-2 font-playfair">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>
                <div>
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-2 font-playfair">School</label>
                  <input
                    type="text"
                    value={profileData.school}
                    onChange={(e) => setProfileData({...profileData, school: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-2 font-playfair">Address</label>
                  <textarea
                    rows="2"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair resize-none"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-[13px] font-playfair"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[13px] leading-[100%] font-[600] font-playfair disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-[#1E1E1E] mb-6 font-playfair">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-[#F0FDF4] rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-1 font-playfair">Password</h3>
                      <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair">Change your password regularly</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[12px] leading-[100%] font-[500] font-playfair"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#F0FDF4] rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-1 font-playfair">Two-Factor Authentication</h3>
                      <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair">
                        {user?.twoFactorEnabled ? '2FA is enabled' : 'Add an extra layer of security'}
                      </p>
                    </div>
                    {user?.twoFactorEnabled ? (
                      <button
                        onClick={() => setShowDisable2FAModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-[12px] leading-[100%] font-[500] font-playfair"
                      >
                        Disable 2FA
                      </button>
                    ) : (
                      <button
                        onClick={handleSetup2FA}
                        disabled={loading2FA}
                        className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors text-[12px] leading-[100%] font-[500] font-playfair disabled:opacity-50"
                      >
                        {loading2FA ? 'Setting up...' : 'Enable 2FA'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-[#1E1E1E] mb-6 font-playfair">Notification Settings</h2>
              
              <div className="space-y-4 mb-6">
                {[
                  { key: 'notifications', label: 'Enable Notifications', description: 'Receive app notifications' },
                  { key: 'examReminders', label: 'Exam Reminders', description: 'Remind me before scheduled exams' },
                  { key: 'studyReminders', label: 'Study Reminders', description: 'Daily study session reminders' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800 font-playfair">{setting.label}</div>
                      <div className="text-sm text-gray-500 font-playfair">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[setting.key]}
                        onChange={(e) => setNotificationSettings({...notificationSettings, [setting.key]: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveNotificationSettings}
                  className="px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] text-[13px] font-playfair"
                >
                  Save Notification Settings
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'exam' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-[#1E1E1E] mb-6 font-playfair">Exam Settings</h2>
              
              <div className="space-y-4 mb-6">
                {[
                  { key: 'autoSave', label: 'Auto-save Progress', description: 'Automatically save exam progress every minute' },
                  { key: 'timerSound', label: 'Timer Sound', description: 'Play sound when time is running out' },
                  { key: 'tabWarning', label: 'Tab Switch Warning', description: 'Warn when switching tabs during exams' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800 font-playfair">{setting.label}</div>
                      <div className="text-sm text-gray-500 font-playfair">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={examSettings[setting.key]}
                        onChange={(e) => setExamSettings({...examSettings, [setting.key]: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveExamSettings}
                  className="px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] text-[13px] font-playfair"
                >
                  Save Exam Settings
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-[#1E1E1E] mb-6 font-playfair">Appearance</h2>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-6">
                <div>
                  <div className="font-medium text-gray-800 font-playfair">Dark Mode</div>
                  <div className="text-sm text-gray-500 font-playfair">Switch to dark theme</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appearanceSettings.darkMode}
                    onChange={(e) => setAppearanceSettings({...appearanceSettings, darkMode: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['green', 'blue', 'purple', 'orange'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAppearanceSettings({...appearanceSettings, theme: color})}
                    className={`p-4 rounded-lg border-2 ${appearanceSettings.theme === color ? `border-${color === 'green' ? '[#10b981]' : color === 'blue' ? '[#3b82f6]' : color === 'purple' ? '[#8b5cf6]' : '[#f97316]'} bg-${color === 'green' ? '[#F0FDF4]' : color === 'blue' ? '[#EFF6FF]' : color === 'purple' ? '[#F5F3FF]' : '[#FFF7ED]'}` : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`h-8 rounded-lg mb-2 bg-gradient-to-r ${color === 'green' ? 'from-[#10b981] to-[#34d399]' : color === 'blue' ? 'from-[#3b82f6] to-[#60a5fa]' : color === 'purple' ? 'from-[#8b5cf6] to-[#a78bfa]' : 'from-[#f97316] to-[#fb923c]'}`}></div>
                    <div className="text-sm font-medium text-gray-800 font-playfair">
                      {color.charAt(0).toUpperCase() + color.slice(1)} Theme
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveAppearanceSettings}
                  className="px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] text-[13px] font-playfair"
                >
                  Save Appearance
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-3 font-playfair">⚠️ Danger Zone</h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="font-medium text-red-700 mb-1 font-playfair">Delete Account</div>
            <div className="text-sm text-red-600 font-playfair">Permanently delete your account and all data</div>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="mt-4 md:mt-0 px-6 py-2.5 border border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition font-playfair"
          >
            Delete Account
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4 font-playfair">Change Password</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-2 font-playfair">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>
                <div>
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-2 font-playfair">New Password</label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>
                <div>
                  <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-2 font-playfair">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-[13px] font-playfair"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] text-[13px] font-playfair disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {show2FAModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4 font-playfair">Setup Two-Factor Authentication</h3>
              
              <div className="mb-6">
                <p className="text-[13px] text-[#626060] mb-4 font-playfair">
                  Scan this QR code with Google Authenticator or enter the secret key manually.
                </p>
                
                {twoFAQRCode && (
                  <div className="flex justify-center mb-4">
                    <img src={twoFAQRCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-[11px] text-[#626060] mb-1 font-playfair">Secret Key:</p>
                  <p className="text-[12px] font-mono font-bold break-all">{twoFASecret}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[12px] leading-[100%] font-[500] text-[#1E1E1E] mb-3 font-playfair">
                  Enter 6-digit code from authenticator
                </label>
                <div className="flex gap-2 justify-center">
                  {twoFAToken.map((digit, index) => (
                    <input
                      key={index}
                      id={`2fa-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handle2FAChange(index, e.target.value)}
                      onKeyDown={(e) => handle2FAKeyDown(index, e)}
                      maxLength={1}
                      className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[18px] font-bold"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShow2FAModal(false)
                    setTwoFAToken(['', '', '', '', '', ''])
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-[13px] font-playfair"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify2FA}
                  className="px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] text-[13px] font-playfair"
                >
                  Verify & Enable
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDisable2FAModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2 font-playfair">Disable Two-Factor Authentication</h3>
              <p className="text-[13px] text-[#626060] mb-6 font-playfair">
                Are you sure you want to disable 2FA? This will make your account less secure.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDisable2FAModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-[13px] font-playfair"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable2FA}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-[13px] font-playfair"
                >
                  Disable 2FA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}