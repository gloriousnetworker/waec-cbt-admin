// components/SupportChat.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const chatContainer = "fixed bottom-6 right-6 z-50";
const chatWindow = "absolute bottom-20 right-0 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden";
const chatHeader = "bg-[#2563EB] text-white p-4 flex justify-between items-center";
const chatHeaderTitle = "text-[16px] leading-[100%] font-[600] font-playfair";
const chatHeaderClose = "text-white hover:text-gray-200 cursor-pointer text-xl";
const chatMessages = "h-96 overflow-y-auto p-4 space-y-4";
const chatMessage = "flex flex-col";
const chatMessageSent = "items-end";
const chatMessageReceived = "items-start";
const chatBubble = "max-w-[80%] p-3 rounded-lg text-[13px] leading-[140%] font-[500] font-playfair";
const chatBubbleSent = "bg-[#2563EB] text-white rounded-br-none";
const chatBubbleReceived = "bg-gray-100 text-[#1E1E1E] rounded-bl-none";
const chatTime = "text-[9px] leading-[100%] font-[400] text-[#9CA3AF] mt-1 font-playfair";
const chatInput = "border-t border-gray-200 p-4 flex gap-2";
const chatInputField = "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2563EB] text-[13px] font-playfair";
const chatSendButton = "px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors font-playfair text-[13px] leading-[100%] font-[600]";

export default function SupportChat({ isOpen, onClose }) {
  const { user, fetchWithAuth } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [view, setView] = useState('list');

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/admin/tickets');
      const data = await response.json();
      setTickets(data.tickets?.filter(t => t.status !== 'closed') || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await fetchWithAuth(`/admin/tickets/${ticketId}`);
      const data = await response.json();
      return data.ticket;
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      return null;
    }
  };

  const handleSelectTicket = async (ticket) => {
    setLoading(true);
    const detailedTicket = await fetchTicketDetails(ticket.id);
    if (detailedTicket) {
      setSelectedTicket(detailedTicket);
      setView('chat');
    }
    setLoading(false);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setView('list');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || sending) return;

    setSending(true);
    try {
      const response = await fetchWithAuth(`/admin/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage })
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedTicket(data.ticket);
        setNewMessage('');
        
        setTickets(prev => prev.map(t => 
          t.id === selectedTicket.id 
            ? { ...t, messages: data.ticket.messages, updatedAt: data.ticket.updatedAt }
            : t
        ));
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-yellow-100 text-yellow-600';
      case 'in-progress': return 'bg-blue-100 text-blue-600';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={chatContainer}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className={chatWindow}
        >
          <div className={chatHeader}>
            <div className="flex items-center gap-2">
              {view === 'chat' && selectedTicket && (
                <button onClick={handleBackToList} className="text-white hover:text-gray-200 mr-2 text-lg">
                  ←
                </button>
              )}
              <div>
                <h3 className={chatHeaderTitle}>
                  {view === 'chat' && selectedTicket ? selectedTicket.subject : 'Support Tickets'}
                </h3>
                <p className="text-[10px] leading-[100%] font-[400] text-white/70 mt-1 font-playfair">
                  {view === 'chat' && selectedTicket ? `Ticket #${selectedTicket.id}` : `${tickets.length} active tickets`}
                </p>
              </div>
            </div>
            <button onClick={onClose} className={chatHeaderClose}>×</button>
          </div>

          {loading && view === 'list' ? (
            <div className="h-96 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : view === 'list' ? (
            <div className="h-96 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] leading-[100%] font-[400] text-[#9CA3AF] font-playfair">No active tickets</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    whileHover={{ backgroundColor: '#F5F5F5' }}
                    onClick={() => handleSelectTicket(ticket)}
                    className="p-4 border-b border-gray-100 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[14px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair truncate max-w-[150px]">
                            {ticket.subject}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] leading-[100%] font-[500] ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mb-1">
                          Ticket #{ticket.id}
                        </p>
                        <p className="text-[12px] leading-[140%] font-[500] text-[#1E1E1E] font-playfair line-clamp-2">
                          {ticket.description}
                        </p>
                        <p className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair mt-2">
                          {ticket.messages?.length || 0} messages
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : selectedTicket && (
            <>
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair mb-1">
                      {selectedTicket.subject}
                    </p>
                    <p className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">
                      Ticket #{selectedTicket.id}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] leading-[100%] font-[500] ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className={chatMessages}>
                {selectedTicket.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`${chatMessage} ${msg.sender === 'admin' ? chatMessageSent : chatMessageReceived}`}
                  >
                    <div className={`${chatBubble} ${msg.sender === 'admin' ? chatBubbleSent : chatBubbleReceived}`}>
                      <p className="text-[8px] leading-[100%] font-[600] mb-1 opacity-70">
                        {msg.sender === 'admin' ? 'You' : 'Support'}
                      </p>
                      <p className="text-[13px] leading-[140%] font-[500]">{msg.content}</p>
                    </div>
                    <div className={chatTime}>{formatTime(msg.timestamp)}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className={chatInput}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className={chatInputField}
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className={`${chatSendButton} ${(!newMessage.trim() || sending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}