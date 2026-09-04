import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Bot, Sparkles, X, Send, Leaf } from 'lucide-react';

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am Farmora AI Assistant. How can I help you with crops, offers, or direct market transport today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'ai', text: data.reply || "I am here to assist with your agricultural offers and live telemetry." }]);
      } else {
        // Fallback intelligent answer
        setMessages(prev => [...prev, { role: 'ai', text: `Farmora AI: Regarding "${userMessage}", our direct trade protocol connects farmers and wholesale buyers with instant escrow payment and live GPS freight tracking.` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: `Farmora AI: Regarding "${userMessage}", our direct trade protocol connects farmers and wholesale buyers with instant escrow payment and live GPS freight tracking.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl shadow-xl bg-gradient-to-br from-[#065f46] to-[#10b981] text-white flex items-center justify-center z-50 border border-white/20 hover:scale-105 transition-transform"
      >
        <Leaf className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl text-[#022c22] border border-[#10b981]/30 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden" style={{ height: '480px' }}>
          
          {/* Header */}
          <div className="p-4 bg-[#e1f2e6] border-b border-[#10b981]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#065f46] text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#022c22]">Farmora AI Assistant</h3>
                <span className="text-[10px] text-[#10b981] font-bold block">Marketplace Guide</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-[#065f46] text-white font-medium shadow-sm' 
                    : 'bg-[#e1f2e6]/80 text-[#022c22] border border-[#10b981]/20 font-medium'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-[#e1f2e6]/80 text-[#065f46] flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 animate-spin text-[#10b981]" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#10b981]/20 bg-white">
            <div className="flex items-center gap-2 bg-[#f8faf8] border border-[#10b981]/30 rounded-2xl p-1.5 pl-3">
              <input 
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about crop listing, escrow, or delivery..."
                className="flex-1 bg-transparent border-none text-xs text-[#022c22] placeholder:text-gray-400 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading} 
                className="w-8 h-8 bg-[#065f46] hover:bg-[#047857] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
}
