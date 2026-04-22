import { create } from 'zustand';

type AuthStore = {
  // State
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  // Actions
  setAccessToken: (token: string) => void;
  logout: () => void;
  setInitializing: (value: boolean) => void;
};

// Nothing is persisted to localStorage — auth state lives in memory only.
// The refresh token (stored separately in localStorage as 'calendar-refresh-token')
// is used on startup to silently restore the session via AppInitializer.
export const useAuthStore = create<AuthStore>()((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: true }),

  logout: () => set({ accessToken: null, isAuthenticated: false }),

  setInitializing: (value) => set({ isInitializing: value }),
}));
