import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { en } from '@/constants/translations/en';
import { mr } from '@/constants/translations/mr';
import type { TranslationKeys } from '@/constants/translations/en';

export type Language = 'en' | 'mr';

const STORAGE_KEY = '@village_language';

const translations: Record<Language, Record<TranslationKeys, string>> = { en, mr };

interface LanguageContextType {
  language: Language;
  languageSelected: boolean;
  isLoading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>('en');
  const [languageSelected, setLanguageSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'en' || saved === 'mr') {
        setLang(saved);
        setLanguageSelected(true);
      }
      setIsLoading(false);
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLang(lang);
    setLanguageSelected(true);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKeys): string => translations[language][key] ?? en[key],
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, languageSelected, isLoading, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
