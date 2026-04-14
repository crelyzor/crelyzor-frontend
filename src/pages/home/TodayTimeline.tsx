import {
  CalendarDays,
  Clock,
  ArrowUpRight,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import type { DisplayMeeting } from '@/lib/meetingHelpers';
import type { CalendarEvent } from '@/services/integrationsService';
import type { TaskWithMeeting } from '@/services/smaService';
import { getStatusLabel, getStatusStyle } from '@/types';
import {
  useGoogleCalendarStatus,
  useGoogleCalendarEvents,
} from '@/hooks/queries/useIntegrationQueries';
import { useUpdateTask } from '@/hooks/queries/useSMAQueries';

type Props = {
  meetings: DisplayMeeting[];
  tasks: TaskWithMeeting[];
  isLoading?: boolean;
  isTasksLoading?: boolean;
  isError?: boolean;
};

type TimelineItem =
  | { kind: 'crelyzor'; meeting: DisplayMeeting; sortKey: number }
  | { kind: 'gcal'; event: CalendarEvent; sortKey: number }
  | { kind: 'task'; task: TaskWithMeeting; sortKey: number };

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function dur(startIso: string, endIso: string) {
  const mins = Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 animate-pulse border border-neutral-100 dark:border-neutral-800">
      <div className="w-10 space-y-1.5 shrink-0">
        <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded w-8 ml-auto" />
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-5 ml-auto" />
      </div>
      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
      </div>
    </div>
  );
}

export function TodayTimeline({
  meetings,
  tasks,
  isLoading,
  isTasksLoading,
  isError,
}: Props) {
  const navigate = useNavigate();
  const updateTask = useUpdateTask('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const startISO = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  })();
  const endISO = (() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  })();

  const { data: gcalStatus } = useGoogleCalendarStatus();
  const isGCalConnected = gcalStatus?.connected === true;
  const { data: gcalEvents = [], isLoading: gcalLoading } =
    useGoogleCalendarEvents(
      isGCalConnected ? startISO : '',
      isGCalConnected ? endISO : ''
    );

  const isToday = (iso: string) => iso.split('T')[0] === today;
  const scheduledTasks = tasks.filter(
    (t) => t.scheduledTime && isToday(t.scheduledTime)
  );
  const dueTodayTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      isToday(t.dueDate) &&
      (!t.scheduledTime || !isToday(t.scheduledTime))
  );
  const todayMeetings = meetings.filter((m) => m.date === today);

  const timedItems: TimelineItem[] = [
    ...todayMeetings.map((m) => ({
      kind: 'crelyzor' as const,
      meeting: m,
      sortKey: Date.parse(m._raw.startTime ?? m.date),
    })),
    ...gcalEvents.map((e) => ({
      kind: 'gcal' as const,
      event: e,
      sortKey: Date.parse(e.startTime),
    })),
    ...scheduledTasks.map((t) => ({
      kind: 'task' as const,
      task: t,
      sortKey: Date.parse(t.scheduledTime!),
    })),
  ].sort((a, b) => a.sortKey - b.sortKey);

  const totalCount = timedItems.length + dueTodayTasks.length;
  const isLoadingAny = isLoading || gcalLoading || isTasksLoading;

  function toggleTask(task: TaskWithMeeting, e: React.MouseEvent) {
    e.stopPropagation();
    updateTask.mutate({
      taskId: task.id,
      data: { isCompleted: !task.isCompleted },
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
            Today
          </span>
          {!isLoadingAny && totalCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
              {totalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            aria-expanded={!isCollapsed}
            aria-label={
              isCollapsed ? 'Expand today section' : 'Collapse today section'
            }
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
            {isCollapsed ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => navigate('/meetings')}
            className="flex items-center gap-0.5 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
          >
            See all
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-1.5">
          {/* Loading */}
          {isLoadingAny && [1, 2, 3].map((i) => <RowSkeleton key={i} />)}

          {/* Error */}
          {!isLoadingAny && isError && (
            <div className="py-8 text-center">
              <p className="text-xs text-neutral-400">Failed to load</p>
            </div>
          )}

          {/* Empty */}
          {!isLoadingAny && !isError && totalCount === 0 && (
            <div className="py-10 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-neutral-300 dark:text-neutral-700" />
              <p className="text-xs text-neutral-400 dark:text-neutral-600">
                Nothing on the calendar
              </p>
            </div>
          )}

          {/* Due Today strip */}
          {!isLoadingAny && !isError && dueTodayTasks.length > 0 && (
            <div className="pb-1">
              <p className="text-[9px] tracking-[0.15em] text-neutral-400 dark:text-neutral-600 uppercase font-medium px-2 mb-1.5">
                Due Today
              </p>
              {dueTodayTasks.map((task, i) => (
                <motion.div
                  key={`dt-${task.id}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() =>
                    task.meetingId
                      ? navigate(`/meetings/${task.meetingId}`)
                      : navigate('/tasks')
                  }
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl
                           border border-dashed border-neutral-200 dark:border-neutral-700
                           hover:border-neutral-300 dark:hover:border-neutral-600
                           hover:bg-neutral-50 dark:hover:bg-neutral-800/50
                           cursor-pointer transition-all duration-150"
                >
                  <button
                    type="button"
                    onClick={(e) => toggleTask(task, e)}
                    className="shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[13px] text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                    {task.title}
                  </p>
                  {task.priority && (
                    <span className="text-[9px] tracking-wider text-neutral-400 dark:text-neutral-600 uppercase shrink-0 font-medium">
                      {task.priority}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Timed items */}
          {!isLoadingAny &&
            !isError &&
            timedItems.map((item, i) => {
              if (item.kind === 'crelyzor') {
                return (
                  <motion.div
                    key={`c-${item.meeting.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.04 }}
                    onClick={() => navigate(`/meetings/${item.meeting.id}`)}
                    className="group flex items-center gap-3 px-3 py-3 rounded-xl
                             bg-white dark:bg-neutral-800/40
                             border border-neutral-100 dark:border-neutral-800
                             hover:border-neutral-200 dark:hover:border-neutral-700
                             hover:bg-neutral-50 dark:hover:bg-neutral-800
                             cursor-pointer transition-all duration-150"
                  >
                    <div className="shrink-0 text-right w-11">
                      <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        {item.meeting.time}
                      </p>
                      <p className="text-[9px] text-neutral-300 dark:text-neutral-600 mt-0.5">
                        {item.meeting.duration}
                      </p>
                    </div>
                    <div className="w-px h-6 bg-neutral-150 dark:bg-neutral-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {item.meeting.title}
                      </p>
                      <span
                        className={`inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${getStatusStyle(item.meeting.status)}`}
                      >
                        {getStatusLabel(item.meeting.status)}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 shrink-0" />
                  </motion.div>
                );
              }

              if (item.kind === 'task') {
                return (
                  <motion.div
                    key={`t-${item.task.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.04 }}
                    onClick={() =>
                      item.task.meetingId
                        ? navigate(`/meetings/${item.task.meetingId}`)
                        : navigate('/tasks')
                    }
                    className="group flex items-center gap-3 px-3 py-3 rounded-xl
                             border border-dashed border-neutral-200 dark:border-neutral-700
                             hover:border-neutral-300 dark:hover:border-neutral-600
                             hover:bg-neutral-50 dark:hover:bg-neutral-800/50
                             cursor-pointer transition-all duration-150"
                  >
                    <div className="shrink-0 text-right w-11">
                      <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        {fmt(item.task.scheduledTime!)}
                      </p>
                    </div>
                    <div className="w-px h-6 bg-neutral-150 dark:bg-neutral-700 shrink-0" />
                    <button
                      type="button"
                      onClick={(e) => toggleTask(item.task, e)}
                      className="shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                    >
                      {item.task.isCompleted ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <p className="text-[13px] text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                      {item.task.title}
                    </p>
                  </motion.div>
                );
              }

              // GCal event
              const el = (
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="shrink-0 text-right w-11">
                    <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                      {fmt(item.event.startTime)}
                    </p>
                    <p className="text-[9px] text-neutral-300 dark:text-neutral-600 mt-0.5">
                      {dur(item.event.startTime, item.event.endTime)}
                    </p>
                  </div>
                  <div className="w-px h-6 bg-neutral-150 dark:bg-neutral-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-neutral-600 dark:text-neutral-400 truncate">
                      {item.event.title}
                    </p>
                    <p className="text-[9px] text-neutral-300 dark:text-neutral-600 mt-0.5">
                      Google Calendar
                    </p>
                  </div>
                </div>
              );

              if (item.event.meetLink) {
                return (
                  <motion.a
                    key={`g-${item.event.id}`}
                    href={item.event.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.04 }}
                    className="block rounded-xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-150"
                  >
                    {el}
                  </motion.a>
                );
              }

              return (
                <motion.div
                  key={`g-${item.event.id}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.04 }}
                  className="rounded-xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800"
                >
                  {el}
                </motion.div>
              );
            })}
        </div>
      )}
    </div>
  );
}
