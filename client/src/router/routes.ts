// Path segments without leading slash or locale. Single source of truth for all paths.
// These will be prefixed with /:lng in the router. Use pathTo(ROUTES.*, lng) for links.
const AUTH_BASE = 'auth' as const;
const LEGAL_BASE = 'legal' as const;

export const ROUTES = {
  HOME: '',
  DASHBOARD: 'dashboard',
  PRICING: 'pricing',
  PROFILE: 'profile',
  EDIT_PROFILE: 'profile/edit',
  EDIT_PROFILE_SEGMENT: 'edit',
  AUTH: {
    BASE: AUTH_BASE,
    SEGMENTS: {
      LOGIN: 'login',
      SIGNUP: 'signup',
      FORGOT_PASSWORD: 'forgot-password',
      RESET_PASSWORD: 'reset-password',
      CONFIRM_SIGNUP: 'confirm-signup',
    },
    LOGIN: `${AUTH_BASE}/login`,
    SIGNUP: `${AUTH_BASE}/signup`,
    FORGOT_PASSWORD: `${AUTH_BASE}/forgot-password`,
    RESET_PASSWORD: `${AUTH_BASE}/reset-password`,
    CONFIRM_SIGNUP: `${AUTH_BASE}/confirm-signup`,
  },
  LEGAL: {
    BASE: LEGAL_BASE,
    SEGMENTS: {
      PRIVACY: 'privacy',
      TERMS: 'terms',
    },
    PRIVACY: `${LEGAL_BASE}/privacy`,
    TERMS: `${LEGAL_BASE}/terms`,
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
