import { CalendarDays, CreditCard } from 'lucide-react';
import type { QuickAction } from '@/types';

export const quickActions: QuickAction[] = [
  {
    icon: CalendarDays,
    label: 'Meetings',
    desc: 'View all your meetings',
    path: '/meetings',
    actionType: 'navigate',
  },
  {
    icon: CreditCard,
    label: 'Cards',
    desc: 'Manage your digital cards',
    path: '/cards',
    actionType: 'navigate',
  },
];
