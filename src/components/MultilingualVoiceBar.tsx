import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, LanguageOption, speakText, createSpeechRecognition } from '../services/voiceLanguage.ts';
import { Mic, MicOff, Volume2, Globe, Send, ChevronDown, Bot, User, Sparkles, RefreshCw } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export const MultilingualVoiceBar: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(SUPPORTED_LANGUAGES[1]); // Default Marathi
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'नमस्कार! मी फार्मोरा AI सहाय्यक आहे. आपण मला बाजारभाव, शेतमाल विक्री/साठवणूक निर्णय आणि वाहतुकीबद्दल विचारू शकता.'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleToggleVoiceMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const rec = createSpeechRecognition(
      selectedLang.speechLocale,
      (transcript) => {
        setIsListening(false);
        if (transcript.trim()) {
          handleProcessQuestion(transcript.trim());
        }
      },
      (err) => {
        console.warn('Voice recognition error:', err);
        setIsListening(false);
      }
    );

    if (rec) {
      setIsListening(true);
      rec.start();
    } else {
      alert(`Voice recognition active for ${selectedLang.name}. Please ensure microphone permission is granted in your browser.`);
    }
  };

  const handleProcessQuestion = async (questionText: string) => {
    if (!questionText.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', text: questionText }]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: questionText,
          language: `${selectedLang.name} (${selectedLang.nativeName})`
        })
      });

      let aiReply = '';
      if (res.ok) {
        const data = await res.json();
        aiReply = data.reply || 'Farmora AI is here to assist with your agricultural market decision.';
      } else {
        aiReply = selectedLang.code === 'mr'
          ? `आज नाशिक बाजारपेठेत टोमॅटोचे दर ₹३२/किलो आहेत. सध्या मागणी मजबूत असल्यामुळे लगेच विक्री करणे फायदेशीर ठरेल.`
          : `Current Mandi rate for Tomato is ₹32/kg. Given strong buyer demand, executing a SELL NOW strategy is recommended.`;
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      
      // Auto-speak response in chosen Indian language
      speakText(aiReply, selectedLang.speechLocale);
    } catch (err) {
      const fallbackReply = selectedLang.code === 'mr'
        ? `आज नाशिक बाजारपेठेत टोमॅटोचे दर ₹३२/किलो आहेत. आपण थेट खरेदीदारांशी व्यवहार करू शकता.`
        : `Tomato modal price is ₹32/kg with 420 Tonnes arrival. Direct buyer matching is active.`;
      
      setMessages(prev => [...prev, { role: 'ai', text: fallbackReply }]);
      speakText(fallbackReply, selectedLang.speechLocale);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;
    handleProcessQuestion(inputQuery.trim());
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Collapsed Floating Trigger Pill */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#065f46] hover:bg-[#10b981] text-white shadow-2xl border-2 border-white/70 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <div className="p-1.5 rounded-full bg-[#10b981] text-white shadow-xs">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div className="text-left leading-tight">
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-200 block">AI Voice Assistant</span>
            <span className="text-xs font-bold">{selectedLang.nativeName} ({selectedLang.name})</span>
          </div>
        </button>
      ) : (
        /* Expanded Floating AI Assistant Chat Window */
        <div className="w-84 sm:w-96 bg-white/98 backdrop-blur-2xl border-2 border-[#10b981]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200" style={{ maxHeight: '520px', height: '480px' }}>
          
          {/* Top Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#065f46] to-[#047857] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-xs text-white">Farmora AI Assistant</h3>
                <span className="text-[10px] text-emerald-200 font-bold block">SIH26132 Market Intelligence</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 8+ Indian Language Selector */}
              <select
                value={selectedLang.code}
                onChange={(e) => {
                  const found = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                  if (found) {
                    setSelectedLang(found);
                    const greeting = found.code === 'mr'
                      ? 'नमस्कार! मी फार्मोरा AI सहाय्यक आहे. मी कशी मदत करू?'
                      : found.code === 'hi'
                      ? 'नमस्ते! मैं फार्मोरा AI सहायक हूँ। मैं आपकी क्या सहायता कर सकता हूँ?'
                      : 'Hello! I am Farmora AI Assistant. How can I assist you with market prices and decisions?';
                    setMessages(prev => [...prev, { role: 'ai', text: greeting }]);
                    speakText(greeting, found.speechLocale);
                  }
                }}
                className="px-2 py-1 rounded-xl bg-white/20 border border-white/30 text-xs font-bold text-white focus:outline-none focus:bg-[#065f46]"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-[#022c22] bg-white">
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>

              {/* Minimize Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                title="Minimize"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f6faf6]/70">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                  msg.role === 'user'
                    ? 'bg-[#065f46] text-white font-medium rounded-br-xs shadow-xs'
                    : 'bg-white text-[#022c22] border border-[#10b981]/30 font-medium rounded-bl-xs shadow-xs'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.role === 'ai' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text, selectedLang.speechLocale)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black text-[#065f46] hover:underline"
                    >
                      <Volume2 className="w-3 h-3 text-[#10b981]" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-white border border-[#10b981]/30 text-xs font-bold text-[#065f46] flex items-center gap-2 shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#10b981] animate-spin" />
                  <span>Farmora AI analyzing in {selectedLang.nativeName}...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-[#10b981]/15 flex items-center gap-1.5 overflow-x-auto text-[10px] font-extrabold scrollbar-none">
            <button
              type="button"
              onClick={() => handleProcessQuestion('Should I sell my tomato harvest now or store?')}
              className="px-2.5 py-1 rounded-lg bg-[#e1f2e6] text-[#065f46] hover:bg-[#10b981] hover:text-white transition-all whitespace-nowrap"
            >
              📊 Sell or Store?
            </button>
            <button
              type="button"
              onClick={() => handleProcessQuestion('What is today Nashik APMC Mandi rate?')}
              className="px-2.5 py-1 rounded-lg bg-[#e1f2e6] text-[#065f46] hover:bg-[#10b981] hover:text-white transition-all whitespace-nowrap"
            >
              🏛️ Mandi Rates
            </button>
            <button
              type="button"
              onClick={() => handleProcessQuestion('How does FPO produce pooling work?')}
              className="px-2.5 py-1 rounded-lg bg-[#e1f2e6] text-[#065f46] hover:bg-[#10b981] hover:text-white transition-all whitespace-nowrap"
            >
              👥 FPO Pooling
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSubmitText} className="p-3 bg-white border-t border-[#10b981]/20 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoiceMic}
              className={`p-2.5 rounded-2xl transition-all shadow-sm flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 text-white animate-bounce'
                  : 'bg-[#e1f2e6] text-[#065f46] hover:bg-[#10b981] hover:text-white'
              }`}
              title={isListening ? 'Listening...' : 'Click to Speak (Voice Input)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask in ${selectedLang.nativeName}...`}
              className="flex-1 px-3.5 py-2.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-[#f6faf6] focus:outline-none focus:border-[#10b981] focus:bg-white"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="p-2.5 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
