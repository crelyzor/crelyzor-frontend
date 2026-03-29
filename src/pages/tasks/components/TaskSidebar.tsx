import { Inbox, CalendarDays, CalendarRange, List, Video } from 'lucide-react';
import type { TaskView } from '@/services/smaService';

const NAV_ITEMS: {
  view: TaskView;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { view: 'inbox', label: 'Inbox', Icon: Inbox },
  { view: 'today', label: 'Today', Icon: CalendarDays },
  { view: 'upcoming', label: 'Upcoming', Icon: CalendarRange },
  { view: 'all', label: 'All Tasks', Icon: List },
  { view: 'from_meetings', label: 'From Meetings', Icon: Video },
];

interface Props {
  activeView: TaskView;
  onViewChange: (view: TaskView) => void;
}

export function TaskSidebar({ activeView, onViewChange }: Props) {
  return (
    <aside className="w-[200px] shrink-0 pt-0.5">
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ view, label, Icon }) => {
          const isActive = activeView === view;
          return (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 w-full text-left
                ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
