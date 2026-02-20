'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Help() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { id: 1, question: 'How do I start a practice exam?', answer: 'Navigate to the "Practice Exams" section, select your subject, choose exam type, and click "Start Exam". You can choose between practice, timed, or mock exams.' },
    { id: 2, question: 'What happens if I switch tabs during an exam?', answer: 'The system detects tab switching and will warn you. Multiple violations may lead to automatic exam submission to maintain exam integrity.' },
    { id: 3, question: 'Can I save my progress during an exam?', answer: 'Yes! The system auto-saves every minute. You can also manually save using the "Save Progress" button in the exam interface.' },
    { id: 4, question: 'How are scores calculated?', answer: 'Scores are based on WAEC marking scheme. Objective questions are auto-graded, while essay questions follow marking guidelines with partial credit for correct steps.' },
    { id: 5, question: 'Can I retake exams?', answer: 'Yes, you can retake any exam unlimited times. Your best score is recorded in your performance analytics.' },
    { id: 6, question: 'How do study groups work?', answer: 'Join or create study groups to collaborate with other students. You can discuss questions, share resources, and schedule study sessions together.' },
    { id: 7, question: 'Is there a mobile app?', answer: 'Yes! This is a Progressive Web App (PWA). You can install it on your mobile device by adding it to your home screen for full app experience.' },
    { id: 8, question: 'How do I report an issue?', answer: 'Use the "Report Issue" button below or contact support at support@waecsimulator.edu.ng. Include screenshots and details for faster resolution.' },
  ];

  const contactMethods = [
    { type: 'Email', address: 'support@waecsimulator.edu.ng', response: 'Within 24 hours', icon: '📧' },
    { type: 'Phone', address: '+234 800 123 4567', response: '9 AM - 5 PM (WAT)', icon: '📞' },
    { type: 'Live Chat', address: 'Available on dashboard', response: 'Instant during hours', icon: '💬' },
    { type: 'Twitter', address: '@waec_simulator', response: 'Within 2 hours', icon: '🐦' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Help & Support</h1>
        <p className="text-gray-600 mt-2">Get assistance and learn how to use the platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Quick Start Guide', description: 'Learn the basics in 5 minutes', icon: '🚀', color: 'from-blue-600 to-blue-500' },
          { title: 'Video Tutorials', description: 'Watch step-by-step guides', icon: '🎥', color: 'from-green-600 to-green-500' },
          { title: 'Download Resources', description: 'Study materials and guides', icon: '📥', color: 'from-purple-600 to-purple-500' },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-r ${item.color} rounded-xl p-6 text-white`}
          >
            <div className="text-3xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-white/90 mb-4">{item.description}</p>
            <button className="px-4 py-2 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition">
              Get Started
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                <span className="text-gray-500">{activeFaq === faq.id ? '−' : '+'}</span>
              </button>
              {activeFaq === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 border-t border-gray-200 bg-gray-50"
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Contact Support</h2>
          <div className="space-y-4">
            {contactMethods.map((method, index) => (
              <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mr-4">{method.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{method.type}</div>
                  <div className="text-sm text-gray-600">{method.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Response time:</div>
                  <div className="text-sm font-medium text-gray-700">{method.response}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Report an Issue</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of issue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
              <textarea
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the issue in detail..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Screenshot (optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-2">📎</div>
                <div className="text-sm text-gray-600">Drag & drop or click to upload</div>
                <input type="file" className="hidden" />
              </div>
            </div>
            <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
              Submit Report
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📱 PWA Installation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">For Mobile:</h4>
            <ul className="space-y-2 text-sm text-blue-600">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Open in Chrome/Safari browser</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Tap the share button (iOS) or menu (Android)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Select "Add to Home Screen"</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Launch like a native app!</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">For Desktop:</h4>
            <ul className="space-y-2 text-sm text-blue-600">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Open in Chrome/Edge browser</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Click the install icon in address bar</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Install as desktop app</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Works offline after first visit</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}