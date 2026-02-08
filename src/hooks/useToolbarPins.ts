import { useState, useCallback } from 'react';
import {
  TOOLBAR_STORAGE_KEY,
  DEFAULT_PINNED_IDS,
  TOOLBAR_ITEMS,
} from '@/constants';
import type { ToolbarItem } from '@/types';

function getPinnedFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(TOOLBAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [...DEFAULT_PINNED_IDS];
  } catch {
    return [...DEFAULT_PINNED_IDS];
  }
}

function savePinnedToStorage(pinned: string[]) {
  localStorage.setItem(TOOLBAR_STORAGE_KEY, JSON.stringify(pinned));
}

export function useToolbarPins() {
  const [pinnedIds, setPinnedIds] = useState<string[]>(getPinnedFromStorage);

  const pinnedItems = pinnedIds
    .map((id) => TOOLBAR_ITEMS.find((item) => item.id === id))
    .filter(Boolean) as ToolbarItem[];

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id];
      savePinnedToStorage(next);
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults = [...DEFAULT_PINNED_IDS];
    setPinnedIds(defaults);
    savePinnedToStorage(defaults);
  }, []);

  const isPinned = useCallback(
    (id: string) => pinnedIds.includes(id),
    [pinnedIds]
  );

  return { pinnedIds, pinnedItems, togglePin, resetToDefaults, isPinned };
}
