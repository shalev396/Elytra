import { createContext, useContext } from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
