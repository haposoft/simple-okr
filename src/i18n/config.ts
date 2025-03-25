'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

const i18n = i18next.createInstance();

i18n
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}.json`)))
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi', 'ja', 'de'],
    defaultNS: 'translation',
    fallbackNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 