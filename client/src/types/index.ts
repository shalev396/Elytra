/**
 * Core user type - single source of truth for user data
 */
export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Access token payload that includes user data and authentication status
 * Stored in sessionStorage (ephemeral)
 */
export interface AccessTokenPayload extends User {
  isAuthenticated: boolean;
}

/**
 * API error response structure
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * API request configuration extension for global loading
 */
export interface ApiRequestConfig {
  showGlobalLoader?: boolean;
}
