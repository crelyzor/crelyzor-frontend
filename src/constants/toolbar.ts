import {
  Home,
  CalendarDays,
  Clock,
  Video,
  Link2,
  Settings,
  Users,
  BarChart3,
  Bell,
  Globe,
} from 'lucide-react';
import type { ToolbarItem, ToolbarItemGroup } from '@/types';

export const TOOLBAR_STORAGE_KEY = 'toolbar-pinned-items';

export const DEFAULT_PINNED_IDS = [
  'home',
  'meetings',
  'share-link',
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
    id: 'availability',
    label: 'Availability',
    icon: Clock,
    action: 'navigate',
    path: '/availability',
    group: 'navigation',
    description: 'Set your schedule',
  },

  // Quick Actions
  {
    id: 'instant-meeting',
    label: 'Instant Meeting',
    icon: Video,
    action: 'action',
    group: 'actions',
    description: 'Start a meeting now',
  },
  {
    id: 'share-link',
    label: 'Booking Link',
    icon: Link2,
    action: 'action',
    group: 'actions',
    description: 'Share your booking page',
  },
  {
    id: 'invite-people',
    label: 'Invite People',
    icon: Users,
    action: 'action',
    group: 'actions',
    description: 'Invite team members',
  },

  // Tools
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    action: 'navigate',
    path: '/analytics',
    group: 'tools',
    description: 'Meeting insights',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    action: 'action',
    group: 'tools',
    description: 'Notification center',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Globe,
    action: 'navigate',
    path: '/integrations',
    group: 'tools',
    description: 'Connected apps',
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
  'actions',
  'tools',
  'settings',
];
