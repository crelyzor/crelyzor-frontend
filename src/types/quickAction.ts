import type { LucideIcon } from 'lucide-react';

export type QuickAction = {
  icon: LucideIcon;
  label: string;
  desc: string;
  path?: string;
  actionType?: 'navigate' | 'copy';
};
