import { Calendar, Mic, Link2, Clock } from 'lucide-react';
import type { QuickAction } from '@/types';

export const quickActions: QuickAction[] = [
  { icon: Calendar, label: 'New Meeting', desc: 'Schedule an in-person meeting' },
  { icon: Clock, label: 'Availability', desc: 'Manage your schedule' },
  { icon: Mic, label: 'Recordings', desc: 'Upload & view recordings' },
  { icon: Link2, label: 'Share Link', desc: 'Send your booking page' },
];
