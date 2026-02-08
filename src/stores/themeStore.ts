import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, ResolvedTheme } from '@/types';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

type ThemeStore = {
  theme: Theme;
  systemTheme: ResolvedTheme;
  resolvedTheme: ResolvedTheme;

  setTheme: (theme: Theme) => void;
  setSystemTheme: (theme: ResolvedTheme) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemTheme: getSystemTheme(),
      get resolvedTheme(): ResolvedTheme {
        const { theme, systemTheme } = get();
        return theme === 'system' ? systemTheme : theme;
      },

      setTheme: (theme) => set({ theme }),
      setSystemTheme: (systemTheme) => set({ systemTheme }),
    }),
    {
      name: 'calendar-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
