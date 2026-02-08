import type { LucideIcon } from 'lucide-react';

export type ToolbarItemGroup = 'navigation' | 'actions' | 'tools' | 'settings';

export type ToolbarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  action: 'navigate' | 'action';
  path?: string;
  group: ToolbarItemGroup;
  description?: string;
};
