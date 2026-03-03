import { create } from 'zustand';
import type { Theme, ResolvedTheme } from '@/types';

const THEME_KEY = 'theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system')
      return stored;
  } catch {
    /* localStorage unavailable (SSR/private browsing) */
  }
  return 'system';
}

type ThemeStore = {
  theme: Theme;
  systemTheme: ResolvedTheme;
  resolvedTheme: ResolvedTheme;

  setTheme: (theme: Theme) => void;
  setSystemTheme: (theme: ResolvedTheme) => void;
};

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: getStoredTheme(),
  systemTheme: getSystemTheme(),
  get resolvedTheme(): ResolvedTheme {
    const { theme, systemTheme } = get();
    return theme === 'system' ? systemTheme : theme;
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* localStorage unavailable */
    }
    set({ theme });
  },
  setSystemTheme: (systemTheme) => set({ systemTheme }),
}));
