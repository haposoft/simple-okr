import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'ja', name: '日本語' },
  { code: 'de', name: 'Deutsch' },
] as const;

export type LanguageCode = typeof languages[number]['code'];

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    (languageCode: LanguageCode) => {
      i18n.changeLanguage(languageCode);
    },
    [i18n]
  );

  const currentLanguage = i18n.language as LanguageCode;

  return {
    currentLanguage,
    changeLanguage,
    languages,
  };
} 