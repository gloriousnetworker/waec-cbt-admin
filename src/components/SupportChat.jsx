// components/SupportChat.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const chatContainer = "fixed bottom-6 right-6 z-[100]";
const chatWindow = "absolute bottom-20 right-0 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden";
const chatHeader = "bg-[#10b981] text-white p-4 flex justify-between items-center";
const chatHeaderTitle = "text-[16px] leading-[100%] font-[600] font-playfair";
const chatHeaderClose = "text-white hover:text-gray-200 cursor-pointer text-xl";
const chatMessages = "h-96 overflow-y-auto p-4 space-y-4";
const chatMessage = "flex flex-col";
const chatMessageSent = "items-end";
const chatMessageReceived = "items-start";
const chatBubble = "max-w-[80%] p-3 rounded-lg text-[13px] leading-[140%] font-[500] font-playfair";
const chatBubbleSent = "bg-[#10b981] text-white rounded-br-none";
const chatBubbleReceived = "bg-gray-100 text-[#1E1E1E] rounded-bl-none";
const chatTime = "text-[9px] leading-[100%] font-[400] text-[#9CA3AF] mt-1 font-playfair";
const chatInput = "border-t border-gray-200 p-4 flex gap-2";
const chatInputField = "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#10b981] text-[13px] font-playfair";
const chatSendButton = "px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors font-playfair text-[13px] leading-[100%] font-[600]";
const notificationBadge = "absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 font-[600] animate-pulse";

export default function SupportChat({ isOpen, onClose, initialTicket = null }) {
  const { user, fetchWithAuth } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [view, setView] = useState('list');
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingInterval = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
      startPolling();
    } else {
      stopPolling();
      setSelectedTicket(null);
      setView('list');
    }
    return () => stopPolling();
  }, [isOpen]);

  // Handle initial ticket when chat opens
  useEffect(() => {
    if (isOpen && initialTicket?.id && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === initialTicket.id);
      if (ticket) {
        // Load the full ticket details including messages
        loadTicketConversation(ticket.id);
      }
    }
  }, [isOpen, initialTicket, tickets]);

  const loadTicketConversation = async (ticketId) => {
    setLoading(true);
    try {
      // Get all tickets to find the one we want
      const response = await fetchWithAuth('/admin/tickets');
      if (response.ok) {
        const data = await response.json();
        const ticket = data.tickets?.find(t => t.id === ticketId);
        if (ticket) {
          setSelectedTicket(ticket);
          setView('chat');
        }
      }
    } catch (error) {
      console.error('Failed to load ticket conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollingInterval.current) return;
    pollingInterval.current = setInterval(() => {
      if (selectedTicket) {
        refreshTicketMessages(selectedTicket.id);
      } else {
        fetchTickets(true);
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const showNotification = (ticket, message) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="bg-white rounded-lg shadow-lg border-l-4 border-[#10b981] p-4 max-w-sm cursor-pointer"
        onClick={() => {
          toast.dismiss(t.id);
          if (!isOpen) {
            onClose();
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openChatWithTicket', { detail: ticket }));
            }, 100);
          } else {
            loadTicketConversation(ticket.id);
          }
        }}
      >
        <div className="flex items-start gap-3">
          <div className="bg-[#10b981] rounded-full p-2 flex-shrink-0">
            <span className="text-white text-sm">💬</span>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-[600] text-[#1E1E1E] font-playfair mb-1">
              New message from Support
            </p>
            <p className="text-[12px] text-[#626060] font-playfair line-clamp-2">
              {message.content}
            </p>
            <p className="text-[10px] text-[#10b981] mt-2 font-playfair">
              Ticket: {ticket.subject}
            </p>
          </div>
        </div>
      </motion.div>
    ), {
      duration: 8000,
      position: 'top-right',
    });
  };

  const refreshTicketMessages = async (ticketId) => {
    try {
      const response = await fetchWithAuth('/admin/tickets');
      if (response.ok) {
        const data = await response.json();
        const updatedTicket = data.tickets?.find(t => t.id === ticketId);
        
        if (updatedTicket && selectedTicket) {
          const oldMessages = selectedTicket.messages?.length || 0;
          const newMessages = updatedTicket.messages?.length || 0;
          
          if (newMessages > oldMessages) {
            const lastMessage = updatedTicket.messages[updatedTicket.messages.length - 1];
            if (lastMessage.sender === 'super_admin') {
              playNotification();
              showNotification(updatedTicket, lastMessage);
              setUnreadCount(prev => prev + 1);
            }
          }
          
          setSelectedTicket(updatedTicket);
        }
        
        setTickets(data.tickets || []);
        
        const unread = data.tickets?.filter(t => 
          t.messages?.some(msg => msg.sender === 'super_admin' && !msg.read)
        ).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to refresh messages:', error);
    }
  };

  const fetchTickets = async (silent = false) => {
    if (!silent) setLoading(true);
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
      console.error('Failed to fetch tickets:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSelectTicket = (ticket) => {
    loadTicketConversation(ticket.id);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setView('list');
    fetchTickets();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || sending) return;

    setSending(true);
    try {
      const response = await fetchWithAuth(`/admin/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.ticket) {
          setSelectedTicket(data.ticket);
          // Update the ticket in the list as well
          setTickets(prev => prev.map(t => 
            t.id === selectedTicket.id ? data.ticket : t
          ));
        }
        setNewMessage('');
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
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-yellow-100 text-yellow-600';
      case 'in_progress': return 'bg-blue-100 text-blue-600';
      case 'resolved': return 'bg-green-100 text-green-600';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isTicketClosed = selectedTicket?.status === 'closed' || selectedTicket?.status === 'resolved';

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={onClose}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#10b981] rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#059669] transition-colors z-[100]"
      >
        <span className="text-white text-2xl">💬</span>
        {unreadCount > 0 && (
          <span className={notificationBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>
    );
  }

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
              {view === 'chat' && selectedTicket ? (
                <button onClick={handleBackToList} className="text-white hover:text-gray-200 mr-2 text-lg">
                  ←
                </button>
              ) : (
                <div className="relative">
                  <span className="text-lg">💬</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}
              <div>
                <h3 className={chatHeaderTitle}>
                  {view === 'chat' && selectedTicket 
                    ? (selectedTicket.subject.length > 25 
                      ? selectedTicket.subject.substring(0, 25) + '...' 
                      : selectedTicket.subject)
                    : 'Support Tickets'}
                </h3>
                {view === 'chat' && selectedTicket && (
                  <p className="text-[10px] leading-[100%] font-[400] text-white/70 mt-1 font-playfair">
                    Ticket #{selectedTicket.id} • {selectedTicket.status}
                  </p>
                )}
                {view === 'list' && (
                  <p className="text-[10px] leading-[100%] font-[400] text-white/70 mt-1 font-playfair">
                    {tickets.length} active ticket{tickets.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className={chatHeaderClose}>×</button>
          </div>

          {loading && view === 'list' ? (
            <div className="h-96 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : view === 'list' ? (
            <div className="h-96 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] leading-[100%] font-[400] text-[#9CA3AF] font-playfair">No active tickets</p>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const hasUnread = ticket.messages?.some(msg => 
                    msg.sender === 'super_admin' && !msg.read
                  );
                  const lastMessage = ticket.messages?.[ticket.messages.length - 1];
                  
                  return (
                    <motion.div
                      key={ticket.id}
                      whileHover={{ backgroundColor: '#F5F5F5' }}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`p-4 border-b border-gray-100 cursor-pointer relative ${hasUnread ? 'bg-[#F0FDF4]' : ''}`}
                    >
                      {hasUnread && (
                        <div className="absolute right-4 top-4 w-2 h-2 bg-[#10b981] rounded-full"></div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className={`text-[14px] leading-[100%] font-[600] ${hasUnread ? 'text-[#10b981]' : 'text-[#1E1E1E]'} font-playfair truncate max-w-[150px]`}>
                              {ticket.subject}
                            </h4>
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] leading-[100%] font-[500] ${getStatusColor(ticket.status)}`}>
                              {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                            </span>
                          </div>
                          <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mb-1">
                            Ticket #{ticket.id}
                          </p>
                          <p className="text-[12px] leading-[140%] font-[500] text-[#1E1E1E] font-playfair line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">
                              {ticket.messages?.length || 0} messages • {ticket.priority} priority
                            </p>
                            {lastMessage && (
                              <p className="text-[8px] text-[#9CA3AF] font-playfair">
                                {formatDateTime(lastMessage.timestamp)}
                              </p>
                            )}
                          </div>
                          {hasUnread && (
                            <p className="text-[10px] text-[#10b981] font-[500] mt-1">
                              Click to respond →
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          ) : selectedTicket && (
            <>
              <div className={`px-4 py-2 border-b border-gray-200 ${
                selectedTicket.status === 'resolved' ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[12px] leading-[100%] font-[600] text-[#1E1E1E] font-playfair mb-1">
                      {selectedTicket.subject}
                    </p>
                    <p className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">
                      Category: {selectedTicket.category} • Priority: {selectedTicket.priority}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] leading-[100%] font-[500] ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status === 'in_progress' ? 'In Progress' : selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className={chatMessages}>
                {selectedTicket.messages?.map((msg, index) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={index}
                      className={`${chatMessage} ${isAdmin ? chatMessageSent : chatMessageReceived}`}
                    >
                      <div className={`${chatBubble} ${isAdmin ? chatBubbleSent : chatBubbleReceived}`}>
                        <p className="text-[8px] leading-[100%] font-[600] mb-1 opacity-70">
                          {isAdmin ? 'You' : 'Support Team'}
                        </p>
                        <p className="text-[13px] leading-[140%] font-[500]">{msg.content}</p>
                      </div>
                      <div className={chatTime}>{formatTime(msg.timestamp)}</div>
                    </div>
                  );
                })}
                {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                  <p className="text-center text-[12px] text-[#626060] py-4">No messages yet. Start the conversation!</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={chatInput}>
                {isTicketClosed ? (
                  <input
                    type="text"
                    value="This ticket is closed"
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 text-[13px] font-playfair cursor-not-allowed"
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your reply..."
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
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}