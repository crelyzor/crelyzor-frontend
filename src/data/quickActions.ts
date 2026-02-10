import { Calendar, Mic, Link2, Clock } from 'lucide-react';
import type { QuickAction } from '@/types';

export const quickActions: QuickAction[] = [
  {
    icon: Calendar,
    label: 'New Meeting',
    desc: 'Schedule an in-person meeting',
    path: '/meetings/create',
    actionType: 'navigate',
  },
  {
    icon: Clock,
    label: 'Availability',
    desc: 'Manage your schedule',
    path: '/availability',
    actionType: 'navigate',
  },
  {
    icon: Mic,
    label: 'Voice Note',
    desc: 'Upload & view voice notes',
    path: '/voice-notes',
    actionType: 'navigate',
  },
  {
    icon: Link2,
    label: 'Share Link',
    desc: 'Send your booking page',
    actionType: 'copy',
  },
];
