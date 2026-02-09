import { useUIStore } from '@/stores';

export function useCommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);

  return {
    open,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
  };
}
