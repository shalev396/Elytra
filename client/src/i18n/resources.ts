/**
 * Merged i18n resources from translation modules.
 * Add or split modules under translations/ and merge here.
 */
import { commonEn, commonHe } from './translations/common';
import { restEn, restHe } from './translations/rest';

export const resources = {
  en: {
    translation: {
      ...commonEn,
      ...restEn,
    },
  },
  he: {
    translation: {
      ...commonHe,
      ...restHe,
    },
  },
};
