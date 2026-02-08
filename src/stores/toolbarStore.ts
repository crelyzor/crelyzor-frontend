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
      partialize: (state) => ({ pinnedIds: state.pinnedIds }),
    }
  )
);
