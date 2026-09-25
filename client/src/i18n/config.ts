// i18n configuration and language utilities

/** Set when the user explicitly picks a language (LanguageSwitcher); wins over the browser. */
export const LANGUAGE_PREFERENCE_STORAGE_KEY = 'elytra-language-preference';

export const SUPPORTED_LANGUAGES = ['en', 'he'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

// RTL languages
export const RTL_LANGUAGES: Language[] = ['he'];

// Check if a language is RTL
export const isRTL = (lng: string): boolean => {
  return RTL_LANGUAGES.includes(lng as Language);
};

// Validate if language is supported
export const isValidLanguage = (lng: string): lng is Language => {
  return SUPPORTED_LANGUAGES.includes(lng as Language);
};

/** The language the user explicitly picked earlier, if any. Storage access may throw. */
export const getStoredLanguagePreference = (): Language | null => {
  try {
    const stored = localStorage.getItem(LANGUAGE_PREFERENCE_STORAGE_KEY);
    return stored !== null && isValidLanguage(stored) ? stored : null;
  } catch {
    return null;
  }
};

/** Remembers an explicit language choice. Ignores storage errors (private mode, quota). */
export const storeLanguagePreference = (lng: Language): void => {
  try {
    localStorage.setItem(LANGUAGE_PREFERENCE_STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
};

/**
 * Language for routing: the URL prefix, then the user's stored choice, then the browser
 * language, then English.
 */
export const getDefaultLanguage = (): Language => {
  const path = window.location.pathname;
  const match = /^\/(en|he)(\/|$)/.exec(path);
  const pathLang = match?.[1];
  if (pathLang !== undefined && isValidLanguage(pathLang)) {
    return pathLang;
  }

  const stored = getStoredLanguagePreference();
  if (stored) {
    return stored;
  }

  const browserLang = navigator.language.split('-')[0];
  if (browserLang !== undefined && isValidLanguage(browserLang)) {
    return browserLang;
  }

  return 'en';
};

// Update document direction and language
export const updateDocumentDirection = (lng: string): void => {
  const htmlElement = document.documentElement;
  htmlElement.lang = lng;
  htmlElement.dir = isRTL(lng) ? 'rtl' : 'ltr';

  // Add/remove RTL class for additional CSS targeting
  if (isRTL(lng)) {
    htmlElement.classList.add('rtl');
    htmlElement.classList.remove('ltr');
  } else {
    htmlElement.classList.add('ltr');
    htmlElement.classList.remove('rtl');
  }
};
