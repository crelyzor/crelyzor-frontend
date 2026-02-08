import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthStore = {
  // State
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAccessToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,

      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: true }),

      logout: () => set({ accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'calendar-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
