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

// Nothing is persisted to localStorage — auth state lives entirely in memory.
// The refresh token is stored as an httpOnly cookie by the backend and is never
// accessible to JS. AppInitializer calls /auth/refresh-token on startup to
// silently restore the session using that cookie.
export const useAuthStore = create<AuthStore>()((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: true }),

  logout: () => set({ accessToken: null, isAuthenticated: false }),

  setInitializing: (value) => set({ isInitializing: value }),
}));
