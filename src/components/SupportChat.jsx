'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const chatContainer = "fixed bottom-6 right-6 z-50";
const chatButton = "w-14 h-14 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:bg-[#1D4ED8] transition-colors cursor-pointer";
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
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const storedMessages = localStorage.getItem('support_chat_messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      const initialMessages = [
        {
          id: 1,
          sender: 'support',
          text: 'Hello! How can we help you today?',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          sender: 'support',
          text: 'Feel free to ask any questions about managing your students or using the admin portal.',
          timestamp: new Date(Date.now() - 3500000).toISOString()
        }
      ];
      setMessages(initialMessages);
      localStorage.setItem('support_chat_messages', JSON.stringify(initialMessages));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      sender: 'admin',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('support_chat_messages', JSON.stringify(updatedMessages));
    setNewMessage('');

    setIsTyping(true);
    setTimeout(() => {
      const response = {
        id: updatedMessages.length + 1,
        sender: 'support',
        text: 'Thank you for your message. Our support team will get back to you shortly.',
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...updatedMessages, response];
      setMessages(finalMessages);
      localStorage.setItem('support_chat_messages', JSON.stringify(finalMessages));
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
            <div>
              <h3 className={chatHeaderTitle}>Support Chat</h3>
              <p className="text-[10px] leading-[100%] font-[400] text-white/70 mt-1 font-playfair">Mega Tech Solutions</p>
            </div>
            <button onClick={onClose} className={chatHeaderClose}>×</button>
          </div>

          <div className={chatMessages}>
            {messages.map((message) => (
              <div key={message.id} className={`${chatMessage} ${message.sender === 'admin' ? chatMessageSent : chatMessageReceived}`}>
                <div className={`${chatBubble} ${message.sender === 'admin' ? chatBubbleSent : chatBubbleReceived}`}>
                  {message.text}
                </div>
                <div className={chatTime}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`${chatMessage} ${chatMessageReceived}`}>
                <div className={`${chatBubble} ${chatBubbleReceived}`}>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
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
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`${chatSendButton} ${!newMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Send
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}