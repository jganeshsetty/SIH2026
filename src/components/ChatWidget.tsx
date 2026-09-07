import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  buyerName: string;
  currentUserId: number; // To differentiate sender vs receiver
  recipientId: number;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose, buyerName, currentUserId, recipientId }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_chats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 1,
        senderId: recipientId,
        text: `Hello! I am interested in your produce. Is the price negotiable?`,
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'farmora_chats') {
        try {
          if (e.newValue) {
            setMessages(JSON.parse(e.newValue));
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      senderId: currentUserId,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');

    try {
      localStorage.setItem('farmora_chats', JSON.stringify(updatedMessages));
      window.dispatchEvent(new Event('storage')); // For same-tab instances if needed
    } catch (err) {}
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[350px] max-w-[calc(100vw-2rem)] h-[450px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-emerald-600/30">
      {/* Header */}
      <div className="bg-emerald-900 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <h3 className="text-sm font-bold">{buyerName}</h3>
            <span className="text-[10px] text-emerald-300">Online</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer">
          <X className="w-5 h-5 text-emerald-100" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
        {messages.map(msg => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div 
                className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                  isMe 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white border border-emerald-100 text-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-emerald-100">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-50 border border-emerald-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
