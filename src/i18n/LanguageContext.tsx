// src/i18n/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode, LanguageMeta, SUPPORTED_LANGUAGES, getTranslation } from '../locales';
import { useAuth } from '../contexts/AuthContext';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageMeta[];
  currentMeta: LanguageMeta;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

const STORAGE_KEY = 'farmora_language';
const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser, token } = useAuth();

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch (e) {}
    return DEFAULT_LANGUAGE;
  });

  // Sync with user's preferred language from database when available
  useEffect(() => {
    if (appUser && (appUser as any).preferredLanguage) {
      const userLang = (appUser as any).preferredLanguage as LanguageCode;
      if (SUPPORTED_LANGUAGES.some(l => l.code === userLang) && userLang !== language) {
        setLanguageState(userLang);
        try {
          localStorage.setItem(STORAGE_KEY, userLang);
        } catch (e) {}
      }
    }
  }, [appUser]);

  // Keep html lang attribute in sync
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((newLang: LanguageCode) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === newLang)) return;

    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {}

    // Dispatch global event for listeners (e.g. speech assistant)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('farmora_language_changed', { detail: { language: newLang } }));
    }

    // Persist to user's profile in backend if authenticated
    if (token) {
      fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ language: newLang })
      }).catch(err => console.warn('Could not persist language to user profile:', err));
    }
  }, [token]);

  const t = useCallback((key: string, fallback?: string) => {
    return getTranslation(language, key, fallback);
  }, [language]);

  const currentMeta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES, currentMeta }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context || !context.language) {
    // Fallback if rendered outside provider
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      t: (key: string, fallback?: string) => getTranslation(DEFAULT_LANGUAGE, key, fallback),
      languages: SUPPORTED_LANGUAGES,
      currentMeta: SUPPORTED_LANGUAGES[0]
    };
  }
  return context;
}
