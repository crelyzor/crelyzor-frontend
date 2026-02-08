import { create } from 'zustand';

type UIStore = {
  // Command Palette
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  // Sidebar (for future use)
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Global loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
};

export const useUIStore = create<UIStore>()((set) => ({
  // Command Palette
  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Global loading
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
