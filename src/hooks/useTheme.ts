import { useThemeStore } from '@/stores';
import type { Theme, ResolvedTheme } from '@/types';

type UseThemeReturn = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

/**
 * Convenience hook wrapping the Zustand theme store.
 * Computes resolvedTheme from theme + systemTheme.
 */
export function useTheme(): UseThemeReturn {
  const theme = useThemeStore((s) => s.theme);
  const systemTheme = useThemeStore((s) => s.systemTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  return { theme, resolvedTheme, setTheme };
}
