'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  examsContainer,
  examsHeader,
  examsTitle,
  examsSubtitle,
  examsTabsGrid,
  examsTabButton,
  examsTabButtonActive,
  examsTabButtonInactive,
  examsSubjectsGrid,
  examsSubjectCard,
  examsSubjectCardInner,
  examsSubjectHeader,
  examsSubjectIcon,
  examsSubjectName,
  examsSubjectStats,
  examsSubjectStatRow,
  examsSubjectStatLabel,
  examsSubjectStatValue,
  examsSubjectButton,
  modalOverlay,
  modalContainer,
  modalTitle,
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger,
  buttonPrimary
} from '../styles';

export default function Support({ setActiveSection, onOpenChat }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: ''
  });

  useEffect(() => {
    const storedTickets = localStorage.getItem('support_tickets');
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    } else {
      const demoTickets = [
        {
          id: 'TKT001',
          subject: 'Cannot add new students',
          category: 'technical',
          priority: 'high',
          status: 'open',
          createdAt: '2024-01-15T10:30:00',
          messages: [
            { sender: 'admin', message: 'Getting error when adding students', timestamp: '2024-01-15T10:30:00' },
            { sender: 'support', message: 'Checking this issue now', timestamp: '2024-01-15T11:15:00' }
          ]
        },
        {
          id: 'TKT002',
          subject: 'Student results not showing',
          category: 'bug',
          priority: 'medium',
          status: 'in-progress',
          createdAt: '2024-01-14T09:00:00',
          messages: [
            { sender: 'admin', message: 'Some results are missing', timestamp: '2024-01-14T09:00:00' }
          ]
        },
        {
          id: 'TKT003',
          subject: 'Need more student accounts',
          category: 'feature',
          priority: 'low',
          status: 'closed',
          createdAt: '2024-01-13T14:20:00',
          messages: [
            { sender: 'admin', message: 'Can we increase the limit?', timestamp: '2024-01-13T14:20:00' },
            { sender: 'support', message: 'Limit increased to 500 students', timestamp: '2024-01-13T15:30:00' }
          ]
        }
      ];
      setTickets(demoTickets);
      localStorage.setItem('support_tickets', JSON.stringify(demoTickets));
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateTicketId = () => {
    const prefix = 'TKT';
    const number = String(tickets.length + 1).padStart(3, '0');
    return `${prefix}${number}`;
  };

  const handleCreateTicket = () => {
    const newTicket = {
      id: generateTicketId(),
      ...formData,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: [
        { sender: 'admin', message: formData.description, timestamp: new Date().toISOString() }
      ]
    };
    
    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
    
    setShowCreateModal(false);
    setFormData({ subject: '', category: 'technical', priority: 'medium', description: '' });
    toast.success('Support ticket created successfully!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-[#FEF3C7] text-[#F59E0B]';
      case 'in-progress': return 'bg-[#DBEAFE] text-[#2563EB]';
      case 'closed': return 'bg-[#D1FAE5] text-[#10B981]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-[#DC2626]';
      case 'medium': return 'text-[#F59E0B]';
      case 'low': return 'text-[#10B981]';
      default: return 'text-[#626060]';
    }
  };

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Support Tickets</h1>
        <p className={examsSubtitle}>Get help from our support team</p>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className={buttonPrimary}
        >
          + Create New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.map((ticket) => (
          <motion.div
            key={ticket.id}
            whileHover={{ y: -2 }}
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer"
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair">
                    {ticket.subject}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
                  Ticket #{ticket.id} • Created {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-[13px] leading-[100%] font-[500] ${getPriorityColor(ticket.priority)} font-playfair`}>
                  {ticket.priority} priority
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
              <span>📁 {ticket.category}</span>
              <span>💬 {ticket.messages.length} messages</span>
              <span>⏱️ Last updated {new Date(ticket.messages[ticket.messages.length - 1].timestamp).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4"
            >
              <h3 className={modalTitle}>Create Support Ticket</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="billing">Billing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    placeholder="Please provide detailed information about your issue..."
                  />
                </div>
              </div>
              <div className={modalActions}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTicket}
                  className={modalButtonDanger}
                >
                  Create Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className={modalTitle}>{selectedTicket.subject}</h3>
                  <p className="text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
                    Ticket #{selectedTicket.id} • Created {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] leading-[100%] font-[500] ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                {selectedTicket.messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-lg ${
                      msg.sender === 'admin' 
                        ? 'bg-[#2563EB] text-white' 
                        : 'bg-gray-100 text-[#1E1E1E]'
                    }`}>
                      <p className="text-[13px] leading-[140%] font-[500] font-playfair mb-1">{msg.message}</p>
                      <p className={`text-[9px] leading-[100%] font-[400] ${
                        msg.sender === 'admin' ? 'text-white/70' : 'text-[#626060]'
                      } font-playfair`}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <textarea
                  placeholder="Type your reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair mb-3"
                  rows="2"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className={modalButtonSecondary}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Reply sent!');
                      setSelectedTicket(null);
                    }}
                    className={modalButtonDanger}
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}