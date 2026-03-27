import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PINNED_IDS, TOOLBAR_ITEMS } from '@/constants';
import type { ToolbarItem } from '@/types';

type ToolbarStore = {
  // State
  pinnedIds: string[];
  controlCenterOpen: boolean;

  // Derived
  pinnedItems: () => ToolbarItem[];

  // Actions
  togglePin: (id: string) => void;
  resetToDefaults: () => void;
  isPinned: (id: string) => boolean;
  setControlCenterOpen: (open: boolean) => void;
};

export const useToolbarStore = create<ToolbarStore>()(
  persist(
    (set, get) => ({
      pinnedIds: [...DEFAULT_PINNED_IDS],
      controlCenterOpen: false,

      pinnedItems: () =>
        get()
          .pinnedIds.map((id) => TOOLBAR_ITEMS.find((item) => item.id === id))
          .filter(Boolean) as ToolbarItem[],

      togglePin: (id) =>
        set((state) => ({
          pinnedIds: state.pinnedIds.includes(id)
            ? state.pinnedIds.filter((p) => p !== id)
            : [...state.pinnedIds, id],
        })),

      resetToDefaults: () => set({ pinnedIds: [...DEFAULT_PINNED_IDS] }),

      isPinned: (id) => get().pinnedIds.includes(id),

      setControlCenterOpen: (open) => set({ controlCenterOpen: open }),
    }),
    {
      name: 'calendar-toolbar',
      version: 1,
      migrate: (persisted) => persisted,
      partialize: (state) => ({ pinnedIds: state.pinnedIds }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Ensure any new DEFAULT_PINNED_IDS items are added to existing saved lists
        const missing = DEFAULT_PINNED_IDS.filter(
          (id) => !state.pinnedIds.includes(id)
        );
        if (missing.length > 0) {
          // Insert each missing item right after its left-neighbour in DEFAULT_PINNED_IDS
          const next = [...state.pinnedIds];
          for (const id of missing) {
            const defaultIdx = DEFAULT_PINNED_IDS.indexOf(id);
            const prev = DEFAULT_PINNED_IDS[defaultIdx - 1];
            const insertAfter = prev ? next.indexOf(prev) : -1;
            if (insertAfter >= 0) next.splice(insertAfter + 1, 0, id);
            else next.push(id);
          }
          state.pinnedIds = next;
        }
      },
    }
  )
);
