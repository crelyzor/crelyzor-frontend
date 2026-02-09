import { useToolbarStore } from '@/stores';

/**
 * Convenience hook wrapping the Zustand toolbar store.
 * Zustand + persist middleware handles localStorage automatically.
 */
export function useToolbarPins() {
  const pinnedIds = useToolbarStore((s) => s.pinnedIds);
  const pinnedItems = useToolbarStore((s) => s.pinnedItems);
  const togglePin = useToolbarStore((s) => s.togglePin);
  const resetToDefaults = useToolbarStore((s) => s.resetToDefaults);
  const isPinned = useToolbarStore((s) => s.isPinned);

  return {
    pinnedIds,
    pinnedItems: pinnedItems(),
    togglePin,
    resetToDefaults,
    isPinned,
  };
}
