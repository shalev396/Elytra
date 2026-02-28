/**
 * Merged i18n resources from per-language translation modules.
 * Each language has its own folder under translations/ (e.g. en/, he/).
 * To add a new language, create a new folder and import it here.
 */
import { en } from './translations/en';
import { he } from './translations/he';

export const resources = {
  en: { translation: en },
  he: { translation: he },
};
