import { CalendarDays, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import type { DisplayMeeting } from '@/lib/meetingHelpers';
import type { CalendarEvent } from '@/services/integrationsService';
import { getStatusStyle, getStatusLabel } from '@/types';
import {
  useGoogleCalendarStatus,
  useGoogleCalendarEvents,
} from '@/hooks/queries/useIntegrationQueries';

type Props = {
  meetings: DisplayMeeting[];
  isLoading?: boolean;
  isError?: boolean;
};

type TimelineItem =
  | { kind: 'crelyzor'; meeting: DisplayMeeting; sortKey: number }
  | { kind: 'gcal'; event: CalendarEvent; sortKey: number };

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl animate-pulse">
      <div className="shrink-0 w-14 space-y-1.5">
        <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-10 ml-auto" />
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-8 ml-auto" />
      </div>
      <div className="w-px h-7 bg-neutral-100 dark:bg-neutral-800 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded w-2/3" />
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/4" />
      </div>
    </div>
  );
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(startIso: string, endIso: string): string {
  const mins = Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function GCalEventContent({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="shrink-0 text-right w-14">
        <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
          {formatTime(event.startTime)}
        </p>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-0.5">
          {formatDuration(event.startTime, event.endTime)}
        </p>
      </div>

      <div className="w-px h-7 bg-neutral-200 dark:bg-neutral-700 shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
          {event.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <CalendarDays className="w-2.5 h-2.5 text-neutral-400" />
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
            Google Calendar
          </span>
        </div>
      </div>
    </div>
  );
}

const GCAL_BASE =
  'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-xl';

const MOTION_PROPS = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.25,
    delay: i * 0.04,
    ease: [0.25, 0.1, 0.25, 1] as const,
  },
});

export function TodayTimeline({ meetings, isLoading, isError }: Props) {
  const navigate = useNavigate();

  // Compute today's date bounds once on mount.
  // Note: midnight edge-case — if the page stays open overnight, these dates are stale.
  const today = new Date().toISOString().split('T')[0];
  const start = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  })();
  const end = (() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  })();

  const { data: gcalStatus } = useGoogleCalendarStatus();
  const isGCalConnected = gcalStatus?.connected === true;

  // Gate the events query — pass empty strings to disable the query when not connected
  const { data: gcalEvents = [], isLoading: gcalLoading } =
    useGoogleCalendarEvents(
      isGCalConnected ? start : '',
      isGCalConnected ? end : ''
    );

  const todayMeetings = meetings.filter((m) => m.date === today);

  const items: TimelineItem[] = [
    ...todayMeetings.map((m) => ({
      kind: 'crelyzor' as const,
      meeting: m,
      // Fallback to date string when startTime is absent (defensive)
      sortKey: Date.parse(m._raw.startTime ?? m.date),
    })),
    ...gcalEvents.map((e) => ({
      kind: 'gcal' as const,
      event: e,
      sortKey: Date.parse(e.startTime),
    })),
  ].sort((a, b) => a.sortKey - b.sortKey);

  const isLoadingAny = isLoading || gcalLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
          <h2 className="text-[11px] tracking-[0.15em] text-neutral-400 dark:text-neutral-500 font-medium uppercase">
            Today
          </h2>
          {!isLoadingAny && items.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
              {items.length}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => navigate('/meetings')}
          className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium h-auto gap-1 px-0"
        >
          See all
          <ArrowUpRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-2">
        {isLoadingAny && [1, 2].map((i) => <RowSkeleton key={i} />)}

        {!isLoadingAny && isError && (
          <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
            <p className="text-xs">Failed to load meetings</p>
          </div>
        )}

        {!isLoadingAny && !isError && items.length === 0 && (
          <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
            <Clock className="w-7 h-7 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No events today</p>
          </div>
        )}

        {!isLoadingAny &&
          !isError &&
          items.map((item, i) => {
            if (item.kind === 'crelyzor') {
              return (
                <motion.div
                  key={`c-${item.meeting.id}`}
                  {...MOTION_PROPS(i)}
                  onClick={() => navigate(`/meetings/${item.meeting.id}`)}
                  className="group flex items-center gap-3 px-4 py-3
                             bg-white dark:bg-neutral-900
                             border border-neutral-100 dark:border-neutral-800
                             hover:border-neutral-200 dark:hover:border-neutral-700
                             hover:shadow-sm rounded-xl cursor-pointer
                             transition-[border-color,box-shadow] duration-200"
                >
                  <div className="shrink-0 text-right w-14">
                    <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {item.meeting.time}
                    </p>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-0.5">
                      {item.meeting.duration}
                    </p>
                  </div>

                  <div className="w-px h-7 bg-neutral-200 dark:bg-neutral-700 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {item.meeting.title}
                    </p>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getStatusStyle(item.meeting.status)}`}
                    >
                      {getStatusLabel(item.meeting.status)}
                    </span>
                  </div>

                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                </motion.div>
              );
            }

            // GCal event — interactive only when meetLink is present
            if (item.event.meetLink) {
              return (
                <motion.a
                  key={`g-${item.event.id}`}
                  href={item.event.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...MOTION_PROPS(i)}
                  className={`group block ${GCAL_BASE} hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-sm cursor-pointer transition-[border-color,box-shadow] duration-200`}
                >
                  <GCalEventContent event={item.event} />
                </motion.a>
              );
            }

            return (
              <motion.div
                key={`g-${item.event.id}`}
                {...MOTION_PROPS(i)}
                className={GCAL_BASE}
              >
                <GCalEventContent event={item.event} />
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
