import React, { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { vi } from './locales/vi';
import { en } from './locales/en';

type Translations = typeof vi;
type Language = 'vi' | 'en';

interface I18nContextType {
  t: (path: string, params?: Record<string, string | number>) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const translations: Record<Language, Translations> = { vi, en };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useSettings();

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let result: any = translations[language as Language] || translations.vi;

    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        console.warn(`Translation key not found: ${path}`);
        return path;
      }
    }

    if (typeof result === 'string' && params) {
      let localizedString = result;
      Object.entries(params).forEach(([key, value]) => {
        localizedString = localizedString.replace(new RegExp(`{${key}}`, 'g'), value.toString());
      });
      return localizedString;
    }

    return result as string;
  };

  return (
    <I18nContext.Provider value={{ t, language: language as Language, setLanguage: setLanguage as any }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
