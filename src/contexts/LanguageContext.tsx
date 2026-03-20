"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

type Translations = typeof locales[typeof defaultLocale];

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const savedLocale = localStorage.getItem('language') as Locale;
    if (savedLocale && locales[savedLocale]) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('language', newLocale);
    document.documentElement.lang = newLocale;
  };

  const translations = locales[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
