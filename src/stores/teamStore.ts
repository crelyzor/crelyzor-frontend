/**
 * Phase 6 P9 — Team workspace store.
 *
 * Tracks which workspace the user is currently acting in:
 *   - `activeTeamId: null` → personal scope (no X-Team-Id header)
 *   - `activeTeamId: "<uuid>"` → team scope (apiClient injects X-Team-Id)
 *
 * Persisted to **sessionStorage** so a refresh keeps the same scope but a
 * new tab / new window starts fresh in personal. Matches the design spec
 * (P9 — per-tab workspace context).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type TeamStore = {
  activeTeamId: string | null;
  setActiveTeam: (teamId: string | null) => void;
};

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      activeTeamId: null,
      setActiveTeam: (teamId) => set({ activeTeamId: teamId }),
    }),
    {
      name: 'crelyzor:team',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ activeTeamId: state.activeTeamId }),
    }
  )
);
