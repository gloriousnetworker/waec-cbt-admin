'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    school: user?.school || '',
    studentId: user?.studentId || '',
    notifications: true,
    examReminders: true,
    studyReminders: true,
    darkMode: false,
    autoSave: true,
    timerSound: true,
    tabWarning: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      school: formData.school,
      studentId: formData.studentId,
    });
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'exam', label: 'Exam Settings', icon: '📝' },
              { id: 'privacy', label: 'Privacy', icon: '🔒' },
              { id: 'appearance', label: 'Appearance', icon: '🎨' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center w-full p-3 rounded-lg mb-2 ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="text-xl mr-3">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Settings</h2>
              <div className="space-y-4">
                {[
                  { name: 'notifications', label: 'Enable Notifications', description: 'Receive app notifications' },
                  { name: 'examReminders', label: 'Exam Reminders', description: 'Remind me before scheduled exams' },
                  { name: 'studyReminders', label: 'Study Reminders', description: 'Daily study session reminders' },
                ].map((setting) => (
                  <div key={setting.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{setting.label}</div>
                      <div className="text-sm text-gray-500">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={setting.name}
                        checked={formData[setting.name]}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'exam' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Exam Settings</h2>
              <div className="space-y-6">
                {[
                  { name: 'autoSave', label: 'Auto-save Progress', description: 'Automatically save exam progress every minute' },
                  { name: 'timerSound', label: 'Timer Sound', description: 'Play sound when time is running out' },
                  { name: 'tabWarning', label: 'Tab Switch Warning', description: 'Warn when switching tabs during exams' },
                ].map((setting) => (
                  <div key={setting.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{setting.label}</div>
                      <div className="text-sm text-gray-500">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={setting.name}
                        checked={formData[setting.name]}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Appearance</h2>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-6">
                <div>
                  <div className="font-medium text-gray-800">Dark Mode</div>
                  <div className="text-sm text-gray-500">Switch to dark theme</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="darkMode"
                    checked={formData.darkMode}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['blue', 'green', 'purple', 'orange'].map((color) => (
                  <button
                    key={color}
                    className={`p-4 rounded-lg border-2 ${color === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`h-8 rounded-lg mb-2 bg-gradient-to-r ${color === 'blue' ? 'from-blue-500 to-blue-400' : color === 'green' ? 'from-green-500 to-green-400' : color === 'purple' ? 'from-purple-500 to-purple-400' : 'from-orange-500 to-orange-400'}`}></div>
                    <div className="text-sm font-medium text-gray-800">
                      {color.charAt(0).toUpperCase() + color.slice(1)} Theme
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Danger Zone</h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="font-medium text-red-700 mb-1">Delete Account</div>
            <div className="text-sm text-red-600">Permanently delete your account and all data</div>
          </div>
          <button className="mt-4 md:mt-0 px-6 py-2.5 border border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}