import type { CalendarEvent } from '@/services/integrationsService';
import type { Meeting } from '@/types';
import type { TaskWithMeeting } from '@/services/smaService';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Returns "YYYY-MM-DD" using local date fields (no UTC shift). */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface CalendarMonthGridProps {
  days: Date[]; // 35 or 42 days, Monday-first
  gcalEvents: CalendarEvent[];
  meetings: Meeting[];
  allTasks: TaskWithMeeting[];
  today: Date;
  anchorMonth: number; // 0-11: determines which days are "outside" the current month
  anchorYear: number;
  onDayClick: (date: Date) => void;
}

export function CalendarMonthGrid({
  days,
  gcalEvents,
  meetings,
  allTasks,
  today,
  anchorMonth,
  anchorYear,
  onDayClick,
}: CalendarMonthGridProps) {
  const todayStr = toLocalDateStr(today);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider select-none"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-neutral-100 dark:divide-neutral-800/60">
        {days.map((day) => {
          const dateStr = toLocalDateStr(day);
          const isToday = dateStr === todayStr;
          const isCurrentMonth =
            day.getMonth() === anchorMonth && day.getFullYear() === anchorYear;

          // GCal events on this day (compare by local date string from ISO start)
          const dayGcalEvents = gcalEvents.filter((e) => {
            const start = new Date(e.startTime);
            return toLocalDateStr(start) === dateStr;
          });

          // Crelyzor meetings on this day
          const dayMeetings = meetings.filter((m) => {
            const start = new Date(m.startTime);
            return toLocalDateStr(start) === dateStr;
          });

          // Tasks with dueDate on this day (use local date from ISO string split)
          const dayTaskCount = allTasks.filter((t) => {
            if (!t.dueDate || t.isCompleted) return false;
            // dueDate is a date-only ISO string ("YYYY-MM-DD") or datetime — handle both
            return t.dueDate.split('T')[0] === dateStr;
          }).length;

          const shownMeetings = dayMeetings.slice(0, 2);
          const extraMeetings = dayMeetings.length - shownMeetings.length;
          const gcalDots = dayGcalEvents.slice(0, 3);
          const extraGcal = dayGcalEvents.length - gcalDots.length;

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(day)}
              className={`relative flex flex-col gap-1 p-1.5 min-h-[80px] text-left transition-colors select-none
                hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer
                ${!isCurrentMonth ? 'opacity-35' : ''}`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold leading-none
                    ${isToday
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                      : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                >
                  {day.getDate()}
                </span>

                {/* Task count badge */}
                {dayTaskCount > 0 && (
                  <span className="text-[9px] font-medium px-1 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 leading-none">
                    {dayTaskCount}
                  </span>
                )}
              </div>

              {/* Meeting chips */}
              <div className="flex flex-col gap-0.5">
                {shownMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="truncate text-[10px] font-medium px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 leading-tight"
                    title={m.title}
                  >
                    {m.title}
                  </div>
                ))}
                {extraMeetings > 0 && (
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 px-1">
                    +{extraMeetings} more
                  </span>
                )}
              </div>

              {/* GCal event dots */}
              {gcalDots.length > 0 && (
                <div className="flex items-center gap-0.5 mt-auto">
                  {gcalDots.map((e) => (
                    <span
                      key={e.id}
                      className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0"
                      title={e.title}
                    />
                  ))}
                  {extraGcal > 0 && (
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 ml-0.5">
                      +{extraGcal}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
