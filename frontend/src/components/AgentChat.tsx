/**
 * Agent Chat Sidebar Component
 * Cursor-style chat with Palantir aesthetics
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  from: 'user' | 'agent';
  timestamp: string;
  thinking?: boolean;
}

const AgentChat: React.FC<AgentChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: 'Hello! I\'m your AI Agent. How can I assist you today?', 
      from: 'agent', 
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingDots, setThinkingDots] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Animate thinking dots
  useEffect(() => {
    if (!isTyping) {
      setThinkingDots('');
      return;
    }

    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount % 3) + 1;
      setThinkingDots('.'.repeat(dotCount));
    }, 300);

    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      from: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand your request. Let me process that for you...',
        from: 'agent',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-[420px] z-50 bg-white border-l border-slate-300/50 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="h-14 border-b border-slate-300/50 bg-white flex items-center justify-between px-4 flex-shrink-0">
              <h3 className="text-xs font-medium text-slate-900 uppercase tracking-tight">SPECTR SYSTEM Agent</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.from === 'user' 
                      ? 'flex justify-end'
                      : ''
                    }
                  >
                    <div
                      className={message.from === 'user' 
                        ? 'bg-slate-600 text-white px-3 py-2 rounded-lg text-xs leading-relaxed whitespace-pre-wrap font-mono max-w-[85%] break-words'
                        : 'text-xs leading-relaxed whitespace-pre-wrap font-mono text-slate-900'
                      }
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" style={{ animationDuration: '0.5s' }} />
                    <span className="text-xs font-mono text-slate-900">
                      thinking{thinkingDots}
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 flex-shrink-0">
              <form onSubmit={handleSend} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full px-3 py-2 pr-12 text-xs bg-white border border-slate-300/50 rounded-lg text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </form>
              <p className="text-[10px] text-slate-500 mt-2 text-center font-mono">
                AI Agent • Powered by SPECTR SYSTEM
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default AgentChat;

