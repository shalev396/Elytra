/**
 * Single source of truth: paths to favicon SVGs in public/.
 * Used for both the tab favicon (theme-provider) and the in-app logo (LogoIcon).
 * To change the icon, replace favicon-light.svg and favicon-dark.svg in public/.
 */
export const FAVICON = {
  light: "/favicon-light.svg",
  dark: "/favicon-dark.svg",
} as const;
