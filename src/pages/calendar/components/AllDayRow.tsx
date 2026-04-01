import { CheckSquare } from 'lucide-react';
import type { TaskWithMeeting } from '@/services/smaService';

interface AllDayRowProps {
  days: Date[];
  tasks: TaskWithMeeting[];
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AllDayRow({ days, tasks }: AllDayRowProps) {
  const tasksByDay = days.map((day) => {
    const dateStr = toLocalDateStr(day);
    return tasks.filter(
      (t) => t.dueDate && t.dueDate.startsWith(dateStr) && !t.scheduledTime
    );
  });

  const hasAny = tasksByDay.some((d) => d.length > 0);
  if (!hasAny) return null;

  return (
    <div className="flex border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 shrink-0">
      {/* Spacer for time-label column */}
      <div className="w-14 shrink-0 flex items-center justify-end pr-2 py-1">
        <span className="text-[9px] text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
          due
        </span>
      </div>

      {days.map((_, i) => (
        <div
          key={i}
          className="flex-1 border-l border-neutral-100 dark:border-neutral-800 px-1 py-1 flex flex-wrap gap-0.5 min-h-[26px]"
        >
          {tasksByDay[i].map((task) => (
            <span
              key={task.id}
              className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 max-w-full"
              title={task.title}
            >
              <CheckSquare className="w-2.5 h-2.5 shrink-0 opacity-70" />
              <span className="truncate">{task.title}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
