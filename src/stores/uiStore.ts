import { create } from 'zustand';

/** Known billing error codes emitted by the backend on 402. */
export type BillingLimitCode =
  | 'TRANSCRIPTION_LIMIT_REACHED'
  | 'RECALL_LIMIT_REACHED'
  | 'AI_CREDITS_EXHAUSTED'
  | 'STORAGE_LIMIT_REACHED';

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

  // Upgrade Modal — opened when a 402 billing limit is hit
  upgradeModalOpen: boolean;
  upgradeModalCode: BillingLimitCode | null;
  openUpgradeModal: (code?: BillingLimitCode) => void;
  closeUpgradeModal: () => void;
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

  // Upgrade Modal
  upgradeModalOpen: false,
  upgradeModalCode: null,
  openUpgradeModal: (code) =>
    set({ upgradeModalOpen: true, upgradeModalCode: code ?? null }),
  closeUpgradeModal: () =>
    set({ upgradeModalOpen: false, upgradeModalCode: null }),
}));
