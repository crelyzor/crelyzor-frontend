import {
  Home,
  CalendarDays,
  Settings,
  Bell,
  CreditCard,
} from 'lucide-react';
import type { ToolbarItem, ToolbarItemGroup } from '@/types';

export const TOOLBAR_STORAGE_KEY = 'toolbar-pinned-items';

export const DEFAULT_PINNED_IDS = [
  'home',
  'meetings',
  'cards',
  'notifications',
  'settings',
] as const;

export const TOOLBAR_ITEMS: ToolbarItem[] = [
  // Navigation
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    action: 'navigate',
    path: '/',
    group: 'navigation',
    description: 'Dashboard overview',
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: CalendarDays,
    action: 'navigate',
    path: '/meetings',
    group: 'navigation',
    description: 'All your meetings',
  },
  {
    id: 'cards',
    label: 'Cards',
    icon: CreditCard,
    action: 'navigate',
    path: '/cards',
    group: 'navigation',
    description: 'Digital business cards',
  },

  // Tools
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    action: 'navigate',
    path: '/notifications',
    group: 'tools',
    description: 'Notification center',
  },

  // Settings
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    action: 'navigate',
    path: '/settings',
    group: 'settings',
    description: 'App settings',
  },
];

export const TOOLBAR_GROUP_LABELS: Record<ToolbarItemGroup, string> = {
  navigation: 'NAVIGATE',
  actions: 'QUICK ACTIONS',
  tools: 'TOOLS',
  settings: 'SETTINGS',
};

export const TOOLBAR_GROUP_ORDER: ToolbarItemGroup[] = [
  'navigation',
  'tools',
  'settings',
];
