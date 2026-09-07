// src/components/LanguageSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LanguageCode } from '../locales';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'compact' | 'full' | 'header';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '', variant = 'header' }) => {
  const { language, setLanguage, languages, currentMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 hover:bg-emerald-50 text-emerald-950 border border-emerald-600/25 shadow-xs hover:border-emerald-600/50 transition-all cursor-pointer font-bold text-xs"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
        </div>
        <span className="leading-none tracking-tight">
          {currentMeta.nativeName}
          <span className="hidden md:inline text-emerald-700/80 text-[11px] ml-1">({currentMeta.name})</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/98 backdrop-blur-xl border border-emerald-600/30 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-emerald-100 text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-[10px] font-bold text-emerald-600">10 Languages</span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin">
            {languages.map((l) => {
              const isSelected = l.code === language;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelect(l.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-100/70 text-emerald-950 font-black'
                      : 'text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm leading-none">{l.flag}</span>
                    <div className="leading-tight">
                      <span className="block font-bold">{l.nativeName}</span>
                      <span className="block text-[10px] text-slate-500 font-medium">{l.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
