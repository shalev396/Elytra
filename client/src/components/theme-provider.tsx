import { useEffect, useState } from "react";
import { FAVICON } from "@/data/favicon";
import type { Theme } from "./theme-context";
import { ThemeProviderContext } from "./theme-context";

type ThemeProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredOrSystemTheme(storageKey: string): Theme {
  const stored = localStorage.getItem(storageKey);
  if (stored === "light" || stored === "dark") return stored;
  return getSystemTheme();
}

export function ThemeProvider({
  children,
  storageKey = "elytra-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    getStoredOrSystemTheme(storageKey),
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Sync favicon with theme (light vs dark) — same paths as LogoIcon (single source of truth)
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) {
      link.href = theme === "dark" ? FAVICON.dark : FAVICON.light;
    }
  }, [theme]);

  // Persist initial system theme on first visit so it sticks until user picks
  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, theme);
    }
  }, [storageKey, theme]);

  const setTheme = (next: Theme) => {
    localStorage.setItem(storageKey, next);
    // Apply class immediately so the DOM updates in the same tick and avoids a flash/blink
    const root = typeof document !== "undefined" ? document.documentElement : null;
    if (root) {
      root.classList.remove("light", "dark");
      root.classList.add(next);
    }
    setThemeState(next);
  };

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
