import { app } from './app';

/**
 * Default page metadata. Sync with index.html for no-JS fallback (crawlers, disabled JS).
 * PageMetadata merges these with per-page overrides.
 */
export const DEFAULT_METADATA = {
  title: 'Elytra | Full-Stack Serverless Template',
  description:
    'A production-ready full-stack serverless template with authentication, file uploads, and modern UI components. Built with React, TypeScript, AWS Lambda, and Tailwind CSS.',
  keywords: 'serverless, react, typescript, aws, lambda, template, full-stack, authentication',
  author: 'Elytra',
  image: '/og-default.png',
  robots: 'index, follow' as const,
  ogType: 'website',
} as const;

/** Base URL for canonical and og:url. Use VITE_APP_URL if set, else origin at build time. */
export function getBaseUrl(): string {
  return app.baseUrl;
}
