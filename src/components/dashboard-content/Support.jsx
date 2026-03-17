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
} from '../../styles/styles';

export default function Support({ setActiveSection, onOpenChat }) {
  const { fetchWithAuth } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: ''
  });

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetchWithAuth('/admin/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);

        const unread = data.tickets?.filter(t =>
          t.messages?.some(msg => msg.sender === 'super_admin' && !msg.read)
        ).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Support ticket created successfully!', { id: toastId });
        setShowCreateModal(false);
        setFormData({ subject: '', category: 'technical', priority: 'medium', description: '' });
        fetchTickets();
        if (onOpenChat) {
          onOpenChat(data.ticket?.id);
        }
      } else {
        toast.error(data.message || 'Failed to create ticket', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error', { id: toastId });
    }
  };

  const handleViewTicket = (ticket) => {
    if (onOpenChat) {
      onOpenChat(ticket.id);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-yellow-100 text-yellow-600';
      case 'in_progress': return 'bg-blue-100 text-blue-600';
      case 'resolved': return 'bg-green-100 text-green-600';
      case 'closed': return 'bg-surface-subtle text-content-muted';
      default: return 'bg-surface-subtle text-content-muted';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-green-100 text-green-600';
      default: return 'bg-surface-subtle text-content-muted';
    }
  };

  const hasUnreadMessages = (ticket) => {
    return ticket.messages?.some(msg =>
      msg.sender === 'super_admin' && !msg.read
    ) || false;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = (ticket.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    highPriority: tickets.filter(t => t.priority === 'high' && t.status !== 'closed' && t.status !== 'resolved').length
  };

  if (loading) {
    return (
      <div className={examsContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <div className="flex items-center gap-3">
          <h1 className={examsTitle}>Support Tickets</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-[10px] leading-[100%] font-medium">
              {unreadCount} new
            </span>
          )}
        </div>
        <p className={examsSubtitle}>Get help from our support team</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">🎫</span>
            <span className="text-2xl font-bold text-content-primary">{stats.total}</span>
          </div>
          <p className="text-xs text-content-muted">Total Tickets</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">🟡</span>
            <span className="text-2xl font-bold text-content-primary">{stats.open}</span>
          </div>
          <p className="text-xs text-content-muted">Open</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">🔵</span>
            <span className="text-2xl font-bold text-content-primary">{stats.inProgress}</span>
          </div>
          <p className="text-xs text-content-muted">In Progress</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[32px]">🔴</span>
            <span className="text-2xl font-bold text-content-primary">{stats.highPriority}</span>
          </div>
          <p className="text-xs text-content-muted">High Priority</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search tickets by ID, subject, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk transition-colors font-semibold text-sm whitespace-nowrap"
            >
              + New Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.map((ticket) => {
          const hasUnread = hasUnreadMessages(ticket);
          const lastMessage = ticket.messages?.[ticket.messages.length - 1];

          return (
            <motion.div
              key={ticket.id}
              whileHover={{ y: -2 }}
              className={`bg-white rounded-lg border ${hasUnread ? 'border-brand-primary border-2' : 'border-border'} p-6 cursor-pointer hover:shadow-md transition-all ${
                ticket.status === 'closed' || ticket.status === 'resolved' ? 'opacity-75' : ''
              }`}
              onClick={() => handleViewTicket(ticket)}
            >
              {hasUnread && (
                <div className="absolute right-6 top-6 w-3 h-3 bg-brand-primary rounded-full animate-pulse"></div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-base font-semibold text-content-primary">
                      {ticket.subject}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] leading-[100%] font-medium ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-xs text-content-muted mb-1">
                    Ticket #{ticket.id}
                  </p>
                  <p className="text-sm text-content-primary line-clamp-2">
                    {ticket.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-content-muted">
                    Created: {formatDate(ticket.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-content-muted">
                <span>📁 {ticket.category}</span>
                <span>💬 {ticket.messages?.length || 0} messages</span>
                {lastMessage && (
                  <span className="text-brand-primary">
                    Last: {formatDate(lastMessage.timestamp)}
                  </span>
                )}
              </div>
              {hasUnread && (
                <div className="mt-3 text-xs text-brand-primary font-semibold">
                  Click to respond →
                </div>
              )}
            </motion.div>
          );
        })}
        {filteredTickets.length === 0 && (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <p className="text-[14px] text-content-muted">No tickets found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={modalTitle}>Create New Support Ticket</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-xs font-medium text-content-primary">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-xs font-medium text-content-primary">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="account">Account Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-xs font-medium text-content-primary">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-xs font-medium text-content-primary">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
                    placeholder="Please provide detailed information..."
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
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dk transition-colors text-sm font-semibold"
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
