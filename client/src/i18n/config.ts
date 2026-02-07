// i18n configuration and language utilities

export const SUPPORTED_LANGUAGES = ["en", "he"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

// RTL languages
export const RTL_LANGUAGES: Language[] = ["he"];

// Check if a language is RTL
export const isRTL = (lng: string): boolean => {
  return RTL_LANGUAGES.includes(lng as Language);
};

// Validate if language is supported
export const isValidLanguage = (lng: string): lng is Language => {
  return SUPPORTED_LANGUAGES.includes(lng as Language);
};

// Get default language (fallback to English)
export const getDefaultLanguage = (): Language => {
  // Try to get from URL first
  const path = window.location.pathname;
  const match = path.match(/^\/(en|he)(\/|$)/);
  if (match && isValidLanguage(match[1])) {
    return match[1];
  }

  // Try browser language
  const browserLang = navigator.language.split("-")[0];
  if (isValidLanguage(browserLang)) {
    return browserLang;
  }

  // Default to English
  return "en";
};

// Update document direction and language
export const updateDocumentDirection = (lng: string): void => {
  const htmlElement = document.documentElement;
  htmlElement.lang = lng;
  htmlElement.dir = isRTL(lng) ? "rtl" : "ltr";

  // Add/remove RTL class for additional CSS targeting
  if (isRTL(lng)) {
    htmlElement.classList.add("rtl");
    htmlElement.classList.remove("ltr");
  } else {
    htmlElement.classList.add("ltr");
    htmlElement.classList.remove("rtl");
  }
};
