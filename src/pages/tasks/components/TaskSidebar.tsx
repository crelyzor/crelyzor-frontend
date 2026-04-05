import {
  Inbox,
  CalendarDays,
  CalendarRange,
  List,
  Video,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TaskView } from '@/services/smaService';

type NavCounts = { inbox?: number; today?: number; upcoming?: number };

const NAV_ITEMS: {
  view: TaskView;
  label: string;
  Icon: React.FC<{ className?: string }>;
  countKey?: keyof NavCounts;
}[] = [
  { view: 'inbox', label: 'Inbox', Icon: Inbox, countKey: 'inbox' },
  { view: 'today', label: 'Today', Icon: CalendarDays, countKey: 'today' },
  {
    view: 'upcoming',
    label: 'Upcoming',
    Icon: CalendarRange,
    countKey: 'upcoming',
  },
  { view: 'all', label: 'All Tasks', Icon: List },
  { view: 'from_meetings', label: 'From Meetings', Icon: Video },
  { view: 'from_voice_notes', label: 'From Voice Notes', Icon: Mic },
];

interface Props {
  activeView: TaskView;
  onViewChange: (view: TaskView) => void;
  counts?: NavCounts;
}

export function TaskSidebar({ activeView, onViewChange, counts }: Props) {
  return (
    <aside className="w-[200px] shrink-0 pt-0.5">
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ view, label, Icon, countKey }) => {
          const isActive = activeView === view;
          const count = countKey ? (counts?.[countKey] ?? 0) : 0;
          return (
            <Button
              key={view}
              variant="ghost"
              onClick={() => onViewChange(view)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full justify-start h-auto
                ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-100'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none
                    ${
                      isActive
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-900'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                >
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
