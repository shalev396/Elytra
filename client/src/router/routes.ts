// Path segments without leading slash or locale. Single source of truth for all paths.
// These will be prefixed with /:lng in the router. Use pathTo(ROUTES.*, lng) for links.
export const ROUTES = {
  HOME: '',
  DASHBOARD: 'dashboard',
  FEATURES: 'features',
  PRICING: 'pricing',
  DOCS: 'docs',
  PROFILE: 'dashboard/profile',
  PROFILE_SEGMENT: 'profile',
  AUTH: {
    BASE: 'auth',
    LOGIN: 'auth/login',
    SIGNUP: 'auth/signup',
    FORGOT_PASSWORD: 'auth/forgot-password',
    RESET_PASSWORD: 'auth/reset-password',
    CONFIRM_SIGNUP: 'auth/confirm-signup',
    SEGMENTS: {
      LOGIN: 'login',
      SIGNUP: 'signup',
      FORGOT_PASSWORD: 'forgot-password',
      RESET_PASSWORD: 'reset-password',
      CONFIRM_SIGNUP: 'confirm-signup',
    },
  },
  LEGAL: {
    BASE: 'legal',
    PRIVACY: 'legal/privacy',
    TERMS: 'legal/terms',
    SEGMENTS: {
      PRIVACY: 'privacy',
      TERMS: 'terms',
    },
  },
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

/**
 * Build full path with locale. Use everywhere instead of hardcoding `/${lng}/${segment}`.
 * Changing URL structure in one place updates the entire app.
 */
export function pathTo(segment: string, lng: string): string {
  const trimmed = segment.replace(/^\/+/, '');
  return trimmed ? `/${lng}/${trimmed}` : `/${lng}`;
}
