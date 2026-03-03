// components/dashboard-content/Help.jsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function Help() {
  const { user } = useAuth();
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-playfair">Help & Support</h1>
        <p className="text-gray-600 mt-2 font-playfair">Get assistance and learn how to use the platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {guides.map((guide, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-r ${guide.color} rounded-xl p-6 text-white cursor-pointer`}
          >
            <div className="text-3xl mb-4">{guide.icon}</div>
            <h3 className="text-xl font-bold mb-2 font-playfair">{guide.title}</h3>
            <p className="text-white/90 mb-4 font-playfair">{guide.description}</p>
            <button className="px-4 py-2 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition font-playfair">
              Learn More →
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 font-playfair">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-800 font-playfair">{faq.question}</span>
                <span className="text-gray-500 text-xl">{activeFaq === faq.id ? '−' : '+'}</span>
              </button>
              {activeFaq === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 border-t border-gray-200 bg-gray-50"
                >
                  <p className="text-gray-600 font-playfair">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 font-playfair">Contact Support</h2>
          <div className="space-y-4">
            {contactMethods.map((method, index) => (
              <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="text-2xl mr-4">{method.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 font-playfair">{method.type}</div>
                  <div className="text-sm text-gray-600 font-playfair">{method.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-playfair">Response:</div>
                  <div className="text-sm font-medium text-gray-700 font-playfair">{method.response}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowContactForm(true)}
            className="mt-6 w-full py-3 bg-[#10b981] text-white font-medium rounded-lg hover:bg-[#059669] transition font-playfair"
          >
            Send Message to Support
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 font-playfair">System Information</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2 font-playfair">Current Version</h3>
              <p className="text-sm text-blue-600 font-playfair">CBT System v2.5.0</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2 font-playfair">Last Update</h3>
              <p className="text-sm text-green-600 font-playfair">March 1, 2026</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2 font-playfair">Documentation</h3>
              <p className="text-sm text-purple-600 mb-2 font-playfair">Access detailed user guides and API documentation</p>
              <button className="text-purple-700 text-sm font-medium hover:underline font-playfair">
                View Documentation →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold mb-2 font-playfair">Need immediate assistance?</h3>
            <p className="text-white/90 font-playfair">Our support team is available 24/7 to help you</p>
          </div>
          <button
            onClick={() => setShowContactForm(true)}
            className="px-8 py-3 bg-white text-[#10b981] font-bold rounded-lg hover:bg-gray-100 transition font-playfair"
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
              <h3 className="text-xl font-bold text-gray-800 mb-4 font-playfair">Contact Support</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-playfair">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] font-playfair"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-playfair">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] font-playfair"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-[13px] font-playfair"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] text-[13px] font-playfair"
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