const dictionaries = {
  en: () => import('../i18n/locales/en.json').then(module => module.default),
  vi: () => import('../i18n/locales/vi.json').then(module => module.default),
  ja: () => import('../i18n/locales/ja.json').then(module => module.default),
  de: () => import('../i18n/locales/de.json').then(module => module.default),
};

export const getDictionary = async (locale: string) => {
  if (!Object.keys(dictionaries).includes(locale)) {
    return dictionaries.en();
  }
  return dictionaries[locale as keyof typeof dictionaries]();
}; 