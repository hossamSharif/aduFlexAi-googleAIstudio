import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from '../types';
import { en } from '../locales/en';
import { ar } from '../locales/ar';

const translations = { en, ar };

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  dir: 'ltr' | 'rtl';
  t: (key: string, options?: Record<string, string | number>) => string;
  formatCurrency: (value: number, currency: string) => string;
  formatNumber: (value: number) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Helper to get nested value from string key
const getNestedTranslation = (lang: Language, key: string): any => {
    return key.split('.').reduce((obj, k) => obj && obj[k], translations[lang]);
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'en' || savedLang === 'ar') ? savedLang : 'ar';
  });
  const [dir, setDir] = useState<'ltr' | 'rtl'>(language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    const newDir = language === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    document.documentElement.lang = language;
    document.documentElement.dir = newDir;
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prevLang) => (prevLang === 'ar' ? 'en' : 'ar'));
  }, []);

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    let translation: string | undefined;

    if (options && typeof options.count === 'number') {
        const pluralRules = new Intl.PluralRules(language);
        const pluralCategory = pluralRules.select(options.count);
        const pluralKey = `${key}_${pluralCategory}`;
        translation = translations[language][pluralKey] || translations[language][`${key}_other`];
        
        // Fallback for English simple plural
        if (!translation && language === 'en') {
             translation = options.count === 1 ? translations[language][key] : translations[language][`${key}_plural`];
        }
    }
    
    if (!translation) {
        translation = translations[language][key];
    }

    if (typeof translation !== 'string') {
        console.warn(`Translation key '${key}' not found for language '${language}'.`);
        return key;
    }

    if (options) {
        return translation.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
            return options[varName]?.toString() || '';
        });
    }

    return translation;
  }, [language]);

  const formatCurrency = useCallback((value: number, currency: string) => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
    }).format(value);
  }, [language]);

  const formatNumber = useCallback((value: number) => {
    return new Intl.NumberFormat(language).format(value);
  }, [language]);
  

  return React.createElement(
    LocalizationContext.Provider,
    { value: { language, setLanguage, toggleLanguage, dir, t, formatCurrency, formatNumber } },
    children
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
