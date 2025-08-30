import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { usePartyKit } from '../hooks/usePartyKit';
import type { Message } from '../hooks/usePartyKit';

export function Chat() {
  const { user, roomState, sendChatMessage } = usePartyKit();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomState.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      sendChatMessage(message.trim());
      setMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {roomState.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                msg.userId === user?.id ? 'order-2' : 'order-1'
              }`}>
                {msg.userId !== user?.id && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <User size={12} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-text">
                      {msg.userName}
                    </span>
                  </div>
                )}
                
                <motion.div
                  className={`p-3 rounded-2xl ${
                    msg.userId === user?.id
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-surface border border-primary/20 text-text rounded-bl-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-xs mt-1 block ${
                    msg.userId === user?.id ? 'text-white/70' : 'text-textSecondary'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-primary/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-primary/20 rounded-lg bg-surface text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            disabled={!user}
          />
          <motion.button
            type="submit"
            disabled={!message.trim() || !user}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
