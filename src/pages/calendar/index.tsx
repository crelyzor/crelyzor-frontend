import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import PageMotion from '@/components/PageMotion';
import { CalendarGrid } from './components/CalendarGrid';
import { QuickCreatePopover } from './components/QuickCreatePopover';
import {
  useGoogleCalendarEvents,
  useGoogleCalendarStatus,
} from '@/hooks/queries/useIntegrationQueries';
import { useMeetingsAll } from '@/hooks/queries/useMeetingQueries';
import { useAllTasks, useUpdateTask } from '@/hooks/queries/useSMAQueries';
import { queryKeys } from '@/lib/queryKeys';
import type { TaskListParams, TaskListResponse } from '@/services/smaService';

// Constant filters used for the calendar task query — must match the setQueryData key exactly
const TASK_FILTERS: TaskListParams = { status: 'all', limit: 200 };

/** Returns the Monday of the week containing `date`. */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun, 1 = Mon …
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask();
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [slotClick, setSlotClick] = useState<{
    time: Date;
    x: number;
    y: number;
  } | null>(null);

  // Fixed "today" reference — never drifts within a render session
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // anchor:
  //   week mode → Monday of visible week
  //   day  mode → the specific day being viewed
  const [anchor, setAnchor] = useState<Date>(() => getWeekStart(new Date()));

  const handleViewMode = (mode: 'week' | 'day') => {
    if (mode === 'week') {
      // Switch to the week containing the current anchor
      setAnchor(getWeekStart(anchor));
    } else {
      // Switch to today
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      setAnchor(d);
    }
    setViewMode(mode);
  };

  const days = useMemo(() => {
    if (viewMode === 'day') return [anchor];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(anchor);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [viewMode, anchor]);

  const rangeStart = days[0];
  const rangeEnd = useMemo(() => {
    const d = new Date(days[days.length - 1]);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [days]);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const { data: gcalStatus } = useGoogleCalendarStatus();
  const { data: gcalEvents = [] } = useGoogleCalendarEvents(
    rangeStart.toISOString(),
    rangeEnd.toISOString()
  );
  const { data: meetings = [] } = useMeetingsAll({
    startDate: rangeStart.toISOString(),
    endDate: rangeEnd.toISOString(),
  });
  const { data: taskData } = useAllTasks(TASK_FILTERS);
  const allTasks = useMemo(() => taskData?.tasks ?? [], [taskData]);

  // Tasks that have a specific scheduledTime within the visible range
  const scheduledTasks = useMemo(
    () =>
      allTasks.filter((t) => {
        if (!t.scheduledTime) return false;
        const ms = new Date(t.scheduledTime).getTime();
        return ms >= rangeStart.getTime() && ms <= rangeEnd.getTime();
      }),
    [allTasks, rangeStart, rangeEnd]
  );

  // Tasks with only a dueDate (shown in the all-day row)
  const dueTasks = useMemo(
    () => allTasks.filter((t) => t.dueDate && !t.scheduledTime),
    [allTasks]
  );

  // ── Navigation ───────────────────────────────────────────────────────────────

  const shiftCalendar = (dir: -1 | 1) => {
    setAnchor((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir * (viewMode === 'week' ? 7 : 1));
      return d;
    });
  };

  const goToday = () => {
    if (viewMode === 'week') {
      setAnchor(getWeekStart(new Date()));
    } else {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      setAnchor(d);
    }
  };

  // ── Header label ─────────────────────────────────────────────────────────────

  const headerLabel = useMemo(() => {
    if (viewMode === 'day') {
      return anchor.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const end = days[6];
    const startStr = rangeStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endStr = end.toLocaleDateString('en-US', {
      ...(end.getMonth() !== rangeStart.getMonth() ? { month: 'short' } : {}),
      day: 'numeric',
      year: 'numeric',
    });
    return `${startStr} – ${endStr}`;
  }, [viewMode, anchor, days, rangeStart]);

  // ── Reschedule handler ───────────────────────────────────────────────────────

  function handleReschedule(taskId: string, newTime: Date) {
    const newScheduledTime = newTime.toISOString();

    // Optimistic update — move chip immediately in the UI
    queryClient.setQueryData(
      queryKeys.sma.allTasks(TASK_FILTERS as Record<string, unknown>),
      (old: TaskListResponse | undefined) => {
        if (!old?.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === taskId ? { ...t, scheduledTime: newScheduledTime } : t
          ),
        };
      }
    );

    updateTask.mutate(
      { taskId, data: { scheduledTime: newScheduledTime } },
      {
        onError: () => {
          // Roll back optimistic update by refetching
          queryClient.invalidateQueries({
            queryKey: queryKeys.sma.allTasks(
              TASK_FILTERS as Record<string, unknown>
            ),
          });
        },
      }
    );
  }

  function handleSlotClick(time: Date, x: number, y: number) {
    setSlotClick({ time, x, y });
  }

  const gcalConnected = gcalStatus?.connected;

  return (
    <PageMotion>
      {/*
       * Bleed out of the Layout's padding so the calendar fills the viewport
       * below the sticky header (h-14 = 3.5rem) plus top padding (py-6 = 1.5rem).
       */}
      <div
        className="flex flex-col -mx-4 sm:-mx-8 -mt-6 sm:-mt-10"
        style={{ height: 'calc(100vh - 3.5rem)' }}
      >
        {/* ── Calendar header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {headerLabel}
            </h1>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => shiftCalendar(-1)}
                className="h-7 w-7"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => shiftCalendar(1)}
                className="h-7 w-7"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={goToday}
                className="text-xs h-7 px-2 ml-0.5"
              >
                Today
              </Button>
            </div>
          </div>

          {/* Week / Day toggle */}
          <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
            {(['week', 'day'] as const).map((mode) => (
              <Button
                key={mode}
                variant="ghost"
                size="xs"
                onClick={() => handleViewMode(mode)}
                className={`text-xs h-6 px-2.5 rounded-md capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {/* ── GCal connection banner ──────────────────────────────────────── */}
        {!gcalConnected && (
          <div className="flex items-center gap-1.5 px-4 sm:px-6 py-1.5 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-500">
              Connect Google Calendar in
            </span>
            <Button
              variant="link"
              size="xs"
              onClick={() => navigate('/settings')}
              className="h-auto p-0 text-[11px] text-neutral-600 dark:text-neutral-400 underline underline-offset-2"
            >
              Settings
            </Button>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-500">
              to see your events here
            </span>
          </div>
        )}

        {/* ── Calendar grid ───────────────────────────────────────────────── */}
        <CalendarGrid
          days={days}
          gcalEvents={gcalEvents}
          meetings={meetings ?? []}
          scheduledTasks={scheduledTasks}
          dueTasks={dueTasks}
          today={today}
          onReschedule={handleReschedule}
          onSlotClick={handleSlotClick}
        />
      </div>

      <AnimatePresence>
        {slotClick && (
          <QuickCreatePopover
            time={slotClick.time}
            x={slotClick.x}
            y={slotClick.y}
            onClose={() => setSlotClick(null)}
          />
        )}
      </AnimatePresence>
    </PageMotion>
  );
}
