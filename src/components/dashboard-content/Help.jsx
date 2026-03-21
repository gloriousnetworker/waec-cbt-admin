// components/dashboard-content/Help.jsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function Help() {
  useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const faqs = [
    { 
      id: 1, 
      question: 'How do I register a new student?', 
      answer: 'Navigate to Students → Add New Student. Fill in the required information (First Name, Last Name, Class). Optional fields like NIN, Phone, and Date of Birth can also be added. The system will automatically generate a unique login ID and email for the student.'
    },
    { 
      id: 2, 
      question: 'How do I create a subject?', 
      answer: 'Go to Subjects → Create New Subject. Enter the subject name, code, select the class, and configure exam settings like duration and question count. The subject will be available for creating questions and assigning to students.'
    },
    { 
      id: 3, 
      question: 'How do I add questions to the question bank?', 
      answer: 'Navigate to Questions → Add Question. Select the subject, enter the question text, provide four options, mark the correct answer, and set the difficulty level. You can also bulk import questions using JSON format.'
    },
    { 
      id: 4, 
      question: 'How do students access exams?', 
      answer: 'Students log in with their credentials and see available exams based on their subjects. They can start exams when enabled. The system auto-saves progress and prevents tab switching during exams.'
    },
    { 
      id: 5, 
      question: 'How are exam results calculated?', 
      answer: 'Scores are calculated based on correct answers. Each question has assigned marks. Results are available immediately after exam completion and can be viewed in the Results section.'
    },
    { 
      id: 6, 
      question: 'What is exam mode and how do I enable it?', 
      answer: 'Exam mode restricts students to only access exams, preventing navigation to other sections. You can toggle exam mode for individual students from the Students page by clicking the exam mode button.'
    },
    { 
      id: 7, 
      question: 'How do I create a support ticket?', 
      answer: 'Go to Support → Create New Ticket. Select category (Technical, Bug, Feature Request), set priority, and describe the issue. Our support team will respond via the ticket system.'
    },
    { 
      id: 8, 
      question: 'What subscription plans are available?', 
      answer: 'Monthly (₦15,000), Termly (₦42,000), Yearly (₦120,000), and Unlimited (₦500,000) plans are available. Each plan determines the number of students you can register and features available.'
    },
  ];

  const guides = [
    {
      title: 'Quick Start Guide',
      description: 'Get started with the admin dashboard in 5 minutes',
      icon: '🚀',
      color: 'from-blue-600 to-blue-500',
      link: '#'
    },
    {
      title: 'Student Management',
      description: 'Complete guide to managing students',
      icon: '👥',
      color: 'from-green-600 to-green-500',
      link: '#'
    },
    {
      title: 'Question Bank Setup',
      description: 'How to create and manage questions',
      icon: '❓',
      color: 'from-purple-600 to-purple-500',
      link: '#'
    },
    {
      title: 'Exam Configuration',
      description: 'Set up and manage exams',
      icon: '📝',
      color: 'from-orange-600 to-orange-500',
      link: '#'
    }
  ];

  const contactMethods = [
    { type: 'Email', address: 'support@kogistatecollege.edu.ng', response: 'Within 24 hours', icon: '📧' },
    { type: 'Phone', address: '+234 800 123 4567', response: '9 AM - 5 PM (WAT)', icon: '📞' },
    { type: 'Live Chat', address: 'Use Support Tickets', response: 'Instant during hours', icon: '💬' },
    { type: 'Knowledge Base', address: 'help.kogistatecollege.edu.ng', response: '24/7 Self-service', icon: '📚' },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setShowContactForm(false);
    setContactForm({ subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-content-primary">Help & Support</h1>
        <p className="text-content-secondary mt-2 text-sm">Get assistance and learn how to use the platform</p>
      </div>

      {/* 2-col on sm, 4-col on lg so all 4 guides fit evenly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {guides.map((guide, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-r ${guide.color} rounded-xl p-4 sm:p-5 text-white cursor-pointer`}
          >
            <div className="text-2xl mb-3">{guide.icon}</div>
            <h3 className="text-base font-bold mb-1">{guide.title}</h3>
            <p className="text-white/90 mb-3 text-sm">{guide.description}</p>
            <button className="px-3 py-1.5 bg-white text-content-primary font-medium rounded-lg hover:bg-surface-subtle transition text-sm">
              Learn More →
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-card p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-content-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-surface-muted"
              >
                <span className="font-medium text-content-primary">{faq.question}</span>
                <span className="text-content-muted text-xl">{activeFaq === faq.id ? '−' : '+'}</span>
              </button>
              {activeFaq === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 border-t border-border bg-surface-muted"
                >
                  <p className="text-content-secondary">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-card p-4 sm:p-6">
          <h2 className="text-base font-bold text-content-primary mb-4">Contact Support</h2>
          <div className="space-y-3">
            {contactMethods.map((method, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-surface-muted transition">
                <div className="text-xl flex-shrink-0 mt-0.5">{method.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-content-primary text-sm">{method.type}</div>
                  <div className="text-xs text-content-secondary truncate">{method.address}</div>
                  <div className="text-xs text-content-muted mt-0.5">{method.response}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowContactForm(true)}
            className="mt-4 w-full py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary-dk transition text-sm min-h-[44px]"
          >
            Send Message to Support
          </button>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-card p-4 sm:p-6">
          <h2 className="text-base font-bold text-content-primary mb-4">System Information</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 text-sm mb-1">Current Version</h3>
              <p className="text-sm text-blue-600">CBT System v2.5.0</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 text-sm mb-1">Last Update</h3>
              <p className="text-sm text-green-600">March 1, 2026</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 text-sm mb-1">Documentation</h3>
              <p className="text-sm text-purple-600 mb-2">Access detailed user guides and API documentation</p>
              <button className="text-purple-700 text-sm font-medium hover:underline">
                View Documentation →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-brand-primary rounded-xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Need immediate assistance?</h3>
            <p className="text-white/90 text-sm">Our support team is available 24/7 to help you</p>
          </div>
          <button
            onClick={() => setShowContactForm(true)}
            className="px-6 py-2.5 bg-white text-brand-primary font-bold rounded-lg hover:bg-surface-subtle transition text-sm min-h-[44px] flex-shrink-0"
          >
            Contact Support Now
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-content-primary mb-4">Contact Support</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-content-primary mb-2">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content-primary mb-2">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 border border-border rounded-md hover:bg-surface-muted text-[13px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk text-[13px]"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}