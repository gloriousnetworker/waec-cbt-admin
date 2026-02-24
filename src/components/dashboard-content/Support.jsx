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
  modalOverlay,
  modalContainer,
  modalTitle,
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger,
  buttonPrimary
} from '../styles';

export default function Support({ setActiveSection }) {
  const { user, fetchWithAuth } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetchWithAuth('/admin/tickets');

      if (!response || !response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateTicket = async () => {
    if (!formData.subject || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetchWithAuth('/admin/tickets', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create ticket');
      }

      setTickets([data.ticket, ...tickets]);
      toast.success('Support ticket created successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowCreateModal(false);
      setFormData({ subject: '', category: 'technical', priority: 'medium', description: '' });
    }
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

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return 'N/A';
    return new Date(timestamp._seconds * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="text-[18px] text-[#626060]">Loading tickets...</div>
        </div>
      </div>
    );
  }

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
                  Ticket #{ticket.id} • Created {formatDate(ticket.createdAt)}
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
              <span>💬 {ticket.messages?.length || 0} messages</span>
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
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    placeholder="Brief description of the issue"
                    required
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
                  <label className="block mb-2 text-[12px] leading-[100%] font-[500] text-[#1E1E1E] font-playfair">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair"
                    placeholder="Please provide detailed information about your issue..."
                    required
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
      </AnimatePresence>
    </div>
  );
}