import { Video, Calendar, Mic, Link2 } from 'lucide-react';
import type { QuickAction } from '@/types';

export const quickActions: QuickAction[] = [
  { icon: Video, label: 'Instant Meeting', desc: 'Start a call right now' },
  { icon: Calendar, label: 'Schedule', desc: 'Plan a meeting ahead' },
  { icon: Mic, label: 'Record Note', desc: 'Capture a voice memo' },
  { icon: Link2, label: 'Share Link', desc: 'Send your booking page' },
];
