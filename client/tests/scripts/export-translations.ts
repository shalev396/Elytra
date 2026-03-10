/**
 * Exports translation objects (en, he) to tests/fixtures/translations.json
 * for Python-based translation completeness tests.
 * Run: npx tsx tests/scripts/export-translations.ts (from client/)
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import from client src - path is relative to this script (tests/scripts/)
type Translations = Record<string, unknown>;
const { en } = (await import('../../src/i18n/translations/en/index.js')) as {
  en: Translations;
};
const { he } = (await import('../../src/i18n/translations/he/index.js')) as {
  he: Translations;
};

const output: Record<string, Translations> = { en, he };

const outPath = join(__dirname, '..', 'fixtures', 'translations.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
console.warn(`Exported translations to ${outPath}`);
