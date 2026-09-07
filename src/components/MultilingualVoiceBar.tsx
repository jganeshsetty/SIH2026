// src/components/MultilingualVoiceBar.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SUPPORTED_LANGUAGES,
  LanguageMeta,
  speakText,
  cancelSpeech,
  ContinuousSpeechController,
  detectLanguageFromScript
} from '../services/voiceLanguage';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  ChevronDown,
  Bot,
  User,
  Sparkles,
  Pause,
  Play,
  Square,
  AlertCircle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  actionRequired?: boolean;
  actionPayload?: any;
  actionExecuted?: boolean;
}

type AssistantState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'PAUSED' | 'ERROR';

export const MultilingualVoiceBar: React.FC = () => {
  const { language, currentMeta, t } = useLanguage();
  const { appUser } = useAuth();

  const [selectedLang, setSelectedLang] = useState<LanguageMeta>(currentMeta);
  const [assistantState, setAssistantState] = useState<AssistantState>('IDLE');
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechControllerRef = useRef<ContinuousSpeechController | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Hello! I am Farmora AI Assistant. You can speak to me naturally in any of the 10 supported Indian languages.'
    }
  ]);

  const assistantStateRef = useRef<AssistantState>(assistantState);
  useEffect(() => {
    assistantStateRef.current = assistantState;
  }, [assistantState]);

  // Keep selectedLang in sync with global website language when it changes
  useEffect(() => {
    const matched = SUPPORTED_LANGUAGES.find(l => l.code === language);
    if (matched) {
      setSelectedLang(matched);
      if (speechControllerRef.current) {
        speechControllerRef.current.setLanguage(matched.speechLocale);
      }
    }
  }, [language]);

  // Scroll to bottom on messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, interimText]);

  // Handle Assistant Speech Output and seamlessly return to listening
  const handleSpeakAiReply = useCallback((text: string, localeCode: string) => {
    if (isAudioMuted) {
      // If audio is muted, return directly to listening if assistant was active
      if (speechControllerRef.current && assistantStateRef.current !== 'PAUSED') {
        speechControllerRef.current.resume();
        setAssistantState('LISTENING');
      }
      return;
    }

    // Pause recognition while speaking to prevent echo
    if (speechControllerRef.current) {
      speechControllerRef.current.pause();
    }
    setAssistantState('SPEAKING');

    speakText(
      text,
      localeCode,
      () => {
        setAssistantState('SPEAKING');
      },
      () => {
        // When speech finishes, seamlessly resume listening
        if (speechControllerRef.current && assistantStateRef.current !== 'PAUSED') {
          speechControllerRef.current.resume();
          setAssistantState('LISTENING');
        } else {
          setAssistantState('IDLE');
        }
      }
    );
  }, [isAudioMuted]);

  // Process a user question or voice transcript
  const handleProcessQuery = useCallback(async (queryText: string, actionConfirmOverride?: boolean) => {
    if (!queryText.trim()) return;

    cancelSpeech();

    // Auto-detect language if script indicates another supported language
    const detected = detectLanguageFromScript(queryText);
    let effectiveLang = selectedLang;
    if (detected && detected.code !== selectedLang.code) {
      effectiveLang = detected;
      setSelectedLang(detected);
      if (speechControllerRef.current) {
        speechControllerRef.current.setLanguage(detected.speechLocale);
      }
    }

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', text: queryText }]);
    setInputQuery('');
    setInterimText('');
    setAssistantState('THINKING');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          language: effectiveLang.code,
          userRole: appUser?.role || 'farmer',
          pendingAction: actionConfirmOverride !== undefined ? pendingAction : pendingAction,
          context: {
            userName: appUser?.name,
            role: appUser?.role
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiReply = data.reply || 'I am ready to help with your agricultural operations.';

        // Check if language was auto-detected by server
        if (data.detectedLanguage) {
          const serverDetected = SUPPORTED_LANGUAGES.find(l => l.code === data.detectedLanguage);
          if (serverDetected && serverDetected.code !== effectiveLang.code) {
            effectiveLang = serverDetected;
            setSelectedLang(serverDetected);
          }
        }

        // Action confirmation or execution handling
        if (data.needsConfirmation && data.pendingAction) {
          setPendingAction(data.pendingAction);
          setMessages(prev => [
            ...prev,
            {
              role: 'ai',
              text: aiReply,
              actionRequired: true,
              actionPayload: data.pendingAction
            }
          ]);
        } else {
          setPendingAction(null);
          setMessages(prev => [
            ...prev,
            {
              role: 'ai',
              text: aiReply,
              actionExecuted: data.actionExecuted
            }
          ]);

          // If an action was executed (e.g. crop added), broadcast for dashboard to sync
          if (data.actionExecuted && data.action === 'CROP_ADDED' && data.crop) {
            try {
              const existingCrops = JSON.parse(localStorage.getItem('farmora_crops') || '[]');
              const newCrop = {
                id: Date.now(),
                name: data.crop.name,
                farmerName: appUser?.name || 'Ganesh Farmer',
                farmerLocation: 'Nashik, Maharashtra',
                quantity: data.crop.quantity,
                unit: data.crop.unit,
                pricePerUnit: data.crop.expectedPrice,
                quality: 'Grade A Fresh',
                harvestDate: new Date().toISOString().split('T')[0],
                status: 'ACTIVE'
              };
              localStorage.setItem('farmora_crops', JSON.stringify([newCrop, ...existingCrops]));
              window.dispatchEvent(new Event('storage'));
            } catch (e) {}
          }

          // If navigation tab requested
          if (data.action === 'NAVIGATE_TAB' && data.tab) {
            window.dispatchEvent(new CustomEvent('farmora_voice_tab_navigate', { detail: { tab: data.tab } }));
          }
        }

        // Auto-speak response in the appropriate Indian language
        handleSpeakAiReply(aiReply, effectiveLang.speechLocale);
      } else {
        const fallbackText = `Current Mandi rate for Tomato is ₹32/kg. Given strong wholesale buyer demand, executing direct trade is recommended.`;
        setMessages(prev => [...prev, { role: 'ai', text: fallbackText }]);
        handleSpeakAiReply(fallbackText, effectiveLang.speechLocale);
      }
    } catch (err) {
      console.warn('Voice AI query error:', err);
      const errReply = 'Unable to reach AI server. Please verify your connection or type your question below.';
      setMessages(prev => [...prev, { role: 'ai', text: errReply }]);
      setAssistantState('IDLE');
    }
  }, [selectedLang, appUser, pendingAction, handleSpeakAiReply]);

  // Initialize Speech Controller
  useEffect(() => {
    const controller = new ContinuousSpeechController({
      localeCode: selectedLang.speechLocale,
      onResult: (transcript, isFinal) => {
        if (isFinal && transcript.trim()) {
          handleProcessQuery(transcript.trim());
        }
      },
      onInterim: (interim) => {
        setInterimText(interim);
      },
      onError: (err) => {
        if (err === 'NOT_SUPPORTED') {
          setVoiceSupported(false);
          setAssistantState('ERROR');
        } else {
          setAssistantState('IDLE');
        }
      },
      onStateChange: (state) => {
        setAssistantState(state);
      }
    });

    if (!controller.isSupported()) {
      setVoiceSupported(false);
    }

    speechControllerRef.current = controller;

    return () => {
      controller.stop();
      cancelSpeech();
    };
  }, [selectedLang.speechLocale, handleProcessQuery]);

  // Start / Pause / Stop Handlers
  const handleToggleContinuous = () => {
    if (!speechControllerRef.current) return;

    if (assistantState === 'LISTENING') {
      speechControllerRef.current.pause();
      setAssistantState('PAUSED');
    } else if (assistantState === 'PAUSED') {
      speechControllerRef.current.resume();
      setAssistantState('LISTENING');
    } else {
      cancelSpeech();
      speechControllerRef.current.start();
      setAssistantState('LISTENING');
    }
  };

  const handleStopConversation = () => {
    cancelSpeech();
    if (speechControllerRef.current) {
      speechControllerRef.current.stop();
    }
    setAssistantState('IDLE');
    setInterimText('');
  };

  const handleConfirmAction = (confirm: boolean) => {
    if (confirm) {
      handleProcessQuery('Yes, confirm', true);
    } else {
      handleProcessQuery('No, cancel', false);
    }
  };

  const handleSelectLanguage = (langMeta: LanguageMeta) => {
    setSelectedLang(langMeta);
    if (speechControllerRef.current) {
      speechControllerRef.current.setLanguage(langMeta.speechLocale);
    }
    const greetingMap: Record<string, string> = {
      en: 'Hello! I am Farmora AI Assistant. How can I help you today?',
      hi: 'नमस्ते! मैं फार्मोरा एआई सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?',
      kn: 'ನಮಸ್ಕಾರ! ನಾನು ಫಾರ್ಮೋರಾ ಎಐ ಸಹಾಯಕ. ನಾನು ಇಂದು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      mr: 'नमस्कार! मी फार्मोरा एआय सहाय्यक आहे. मी आज आपली कशी मदत करू शकतो?',
      te: 'నమస్కారం! నేను ఫార్మోరా ఏఐ సహాయకుడిని. నేను మీకు ఎలా సహాయపడగలను?',
      ta: 'வணக்கம்! நான் பார்மோரா ஏஐ உதவியாளர். உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
      ml: 'നമസ്കാരം! ഞാൻ ഫാർമോറ എഐ അസിസ്റ്റന്റാണ്. ഞാൻ എങ്ങനെ സഹായിക്കണം?',
      bn: 'নমস্কার! আমি ফার্মোরা এআই সহায়ক। আমি কীভাবে সাহায্য করতে পারি?',
      gu: 'નમસ્તે! હું ફાર્મોરા એઆઈ સહાયક છું. હું તમારી કેવી રીતે મદદ કરી શકું?',
      pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਫਾਰਮੋਰਾ ਏਆਈ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?'
    };
    const greeting = greetingMap[langMeta.code] || greetingMap.en;
    setMessages(prev => [...prev, { role: 'ai', text: greeting }]);
    handleSpeakAiReply(greeting, langMeta.speechLocale);
  };

  // State Label & Pill Styling
  const getStateLabel = () => {
    switch (assistantState) {
      case 'LISTENING':
        return t('voice.listening', 'Listening...');
      case 'THINKING':
        return t('voice.thinking', 'Understanding...');
      case 'SPEAKING':
        return t('voice.speaking', 'Speaking...');
      case 'PAUSED':
        return t('voice.paused', 'Paused');
      case 'ERROR':
        return t('voice.error', 'Voice unavailable');
      default:
        return t('voice.idle', 'Ready to speak');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Pill */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            // Automatically begin continuous listening upon opening if supported
            if (speechControllerRef.current && voiceSupported && assistantState === 'IDLE') {
              speechControllerRef.current.start();
              setAssistantState('LISTENING');
            }
          }}
          className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 hover:from-emerald-900 hover:to-emerald-700 text-white shadow-2xl border-2 border-white/80 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <div className="relative">
            <div className={`p-2.5 rounded-full ${
              assistantState === 'LISTENING' ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'
            } text-white shadow-md flex items-center justify-center`}>
              <Mic className="w-4 h-4 text-white" />
            </div>
            {assistantState === 'LISTENING' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200 block">
              {t('voice.triggerButton', 'AI Voice Assistant')}
            </span>
            <span className="text-[11px] font-semibold text-white/90">
              {selectedLang.nativeName} • {getStateLabel()}
            </span>
          </div>
        </button>
      ) : (
        /* Expanded Floating Assistant Window */
        <div
          className="w-84 sm:w-96 bg-white/98 backdrop-blur-2xl border-2 border-emerald-600/35 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
          style={{ maxHeight: '560px', height: '520px' }}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white leading-tight">Farmora AI Assistant</h3>
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    assistantState === 'LISTENING' ? 'bg-rose-400 animate-pulse' :
                    assistantState === 'THINKING' ? 'bg-amber-400 animate-spin' :
                    assistantState === 'SPEAKING' ? 'bg-emerald-400 animate-bounce' : 'bg-slate-400'
                  }`} />
                  {getStateLabel()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Audio Mute Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!isAudioMuted) cancelSpeech();
                  setIsAudioMuted(!isAudioMuted);
                }}
                className={`p-2 rounded-xl transition-colors ${
                  isAudioMuted ? 'bg-rose-900/60 text-rose-300' : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* 10 Languages Selector */}
              <select
                value={selectedLang.code}
                onChange={(e) => {
                  const match = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                  if (match) handleSelectLanguage(match);
                }}
                className="px-2 py-1.5 rounded-xl bg-white/15 border border-white/30 text-xs font-bold text-white focus:outline-none focus:bg-emerald-950"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-slate-900 bg-white">
                    {l.flag} {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  handleStopConversation();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                title="Close"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Continuous Voice Status Banner */}
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-600/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-900">Continuous Mode:</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                assistantState === 'LISTENING' ? 'bg-rose-600 text-white animate-pulse' :
                assistantState === 'PAUSED' ? 'bg-amber-500 text-white' : 'bg-emerald-200 text-emerald-950'
              }`}>
                {assistantState}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleContinuous}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                {assistantState === 'LISTENING' ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>Listen</span>
                  </>
                )}
              </button>
              {assistantState !== 'IDLE' && (
                <button
                  type="button"
                  onClick={handleStopConversation}
                  className="p-1 rounded-lg text-slate-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                  title="Stop"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f6faf6]/80">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs ${
                    msg.role === 'user'
                      ? 'bg-emerald-900 text-white font-medium rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-900 border border-emerald-600/25 font-medium rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Pending Confirmation Safety Card */}
                  {msg.actionRequired && pendingAction && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Confirmation Required</span>
                      </div>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Confirming will execute this operation and update your dashboard.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmAction(true)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('voice.confirmYes', 'Yes, Confirm')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmAction(false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                        >
                          <span>{t('voice.confirmNo', 'Cancel')}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Audio Replay Button */}
                  {msg.role === 'ai' && !msg.actionRequired && (
                    <button
                      type="button"
                      onClick={() => handleSpeakAiReply(msg.text, selectedLang.speechLocale)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3 text-emerald-700" />
                      <span>Replay Voice</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Live Interim Transcript */}
            {interimText && (
              <div className="flex justify-end">
                <div className="max-w-[85%] p-3 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs italic font-medium animate-pulse">
                  "{interimText}..."
                </div>
              </div>
            )}

            {/* Thinking / Processing Spinner */}
            {assistantState === 'THINKING' && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-600/25 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Understanding in {selectedLang.nativeName}...</span>
                </div>
              </div>
            )}

            {!voiceSupported && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {t(
                    'voice.voiceUnsupported',
                    'Voice recognition is not supported in this browser. You can type your request below.'
                  )}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-emerald-600/15 flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
            <button
              type="button"
              onClick={() => handleProcessQuery('Should I sell my tomato harvest now or store?')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap cursor-pointer"
            >
              📊 Sell or Store?
            </button>
            <button
              type="button"
              onClick={() => handleProcessQuery('Add 100 kg of tomato')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap cursor-pointer"
            >
              🌾 Add 100 kg Tomato
            </button>
            <button
              type="button"
              onClick={() => handleProcessQuery('Show my buyer offers')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap cursor-pointer"
            >
              🤝 Buyer Offers
            </button>
            <button
              type="button"
              onClick={() => handleProcessQuery('Where is my truck?')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap cursor-pointer"
            >
              🚚 Track Freight
            </button>
          </div>

          {/* Input Form with Mic Toggle */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!inputQuery.trim()) return;
              handleProcessQuery(inputQuery.trim());
            }}
            className="p-3 bg-white border-t border-emerald-600/20 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleContinuous}
              className={`p-2.5 rounded-2xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
                assistantState === 'LISTENING'
                  ? 'bg-rose-600 text-white animate-bounce'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white'
              }`}
              title={assistantState === 'LISTENING' ? 'Listening...' : 'Click to Speak'}
            >
              {assistantState === 'LISTENING' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask in ${selectedLang.nativeName} or English...`}
              className="flex-1 px-3.5 py-2.5 rounded-2xl border border-emerald-600/25 text-xs font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || assistantState === 'THINKING'}
              className="p-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
