import { CalendarDays, CalendarClock, CreditCard, Mic } from 'lucide-react';
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
    icon: CalendarClock,
    label: 'Bookings',
    desc: 'View your bookings',
    path: '/bookings',
    actionType: 'navigate',
  },
  {
    icon: Mic,
    label: 'Voice Notes',
    desc: 'Quick audio recordings',
    path: '/voice-notes',
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
