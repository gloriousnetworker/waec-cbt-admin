// components/dashboard-content/Support.jsx
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

export default function Support({ setActiveSection, onOpenChat }) {
  const { fetchWithAuth } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
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
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      toast.error('Failed to fetch tickets');
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

    const toastId = toast.loading('Creating ticket...');

    try {
      const response = await fetchWithAuth('/admin/tickets', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Support ticket created successfully!', { id: toastId });
        setTickets([data.ticket, ...tickets]);
        setShowCreateModal(false);
        setFormData({ subject: '', category: 'technical', priority: 'medium', description: '' });
        if (onOpenChat) {
          onOpenChat();
        }
      } else {
        toast.error(data.message || 'Failed to create ticket', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    const toastId = toast.loading('Sending reply...');

    try {
      const response = await fetchWithAuth(`/admin/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: replyMessage })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Reply sent successfully', { id: toastId });
        setSelectedTicket(data.ticket);
        setReplyMessage('');
        fetchTickets();
      } else {
        toast.error(data.message || 'Failed to send reply', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
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
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
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
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md"
            onClick={() => {
              setSelectedTicket(ticket);
              setShowTicketModal(true);
            }}
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

            <p className="text-[13px] leading-[140%] font-[400] text-[#1E1E1E] font-playfair mb-3 line-clamp-2">
              {ticket.description}
            </p>

            <div className="flex items-center gap-4 text-[12px] leading-[100%] font-[400] text-[#626060] font-playfair">
              <span>📁 {ticket.category}</span>
              <span>💬 {ticket.messages?.length || 0} messages</span>
              {ticket.updatedAt && (
                <span>Updated: {formatDate(ticket.updatedAt)}</span>
              )}
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
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors text-[13px] leading-[100%] font-[600] font-playfair"
                >
                  Create Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showTicketModal && selectedTicket && (
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
              className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[20px] leading-[120%] font-[700] text-[#1E1E1E] font-playfair">
                      {selectedTicket.subject}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-[500] bg-gray-100 ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <p className="text-[13px] leading-[100%] font-[400] text-[#626060] font-playfair mb-2">
                    Ticket #{selectedTicket.id} • {selectedTicket.category}
                  </p>
                  <div className="flex gap-4 text-[11px] leading-[100%] font-[400] text-[#9CA3AF] font-playfair">
                    <span>Created: {formatDateTime(selectedTicket.createdAt)}</span>
                    <span>Updated: {formatDateTime(selectedTicket.updatedAt)}</span>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-[13px] leading-[140%] font-[400] text-[#1E1E1E] font-playfair">
                      {selectedTicket.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h4 className="text-[16px] leading-[120%] font-[600] text-[#1E1E1E] mb-4 font-playfair">Conversation</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                  {selectedTicket.messages?.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-lg ${
                        msg.sender === 'admin' 
                          ? 'bg-[#2563EB] text-white' 
                          : 'bg-gray-100 text-[#1E1E1E]'
                      }`}>
                        <p className="text-[10px] leading-[100%] font-[500] mb-1 opacity-70">
                          {msg.sender === 'admin' ? 'You' : 'Support Team'}
                        </p>
                        <p className="text-[13px] leading-[140%] font-[500] font-playfair">{msg.content}</p>
                        <p className={`text-[9px] leading-[100%] font-[400] mt-2 ${
                          msg.sender === 'admin' ? 'text-white/70' : 'text-[#626060]'
                        } font-playfair`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] mb-4 font-playfair">Reply to Ticket</h4>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair mb-4"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className={`px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors text-[13px] leading-[100%] font-[600] ${
                        !replyMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}