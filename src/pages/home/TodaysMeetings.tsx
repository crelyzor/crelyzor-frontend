import { Calendar, ArrowUpRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import type { DisplayMeeting } from '@/lib/meetingHelpers';
import { getStatusStyle, getStatusLabel } from '@/types';

type Props = {
  meetings: DisplayMeeting[];
  isLoading?: boolean;
  isError?: boolean;
};

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

export function TodaysMeetings({ meetings, isLoading, isError }: Props) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const todayMeetings = meetings.filter((m) => m.date === today);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <h2 className="text-[11px] tracking-[0.15em] text-neutral-400 dark:text-neutral-500 font-medium uppercase">
            Today
          </h2>
          {!isLoading && todayMeetings.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
              {todayMeetings.length}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/meetings')}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-medium cursor-pointer group"
        >
          See all
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="space-y-2">
        {isLoading && [1, 2].map((i) => <RowSkeleton key={i} />)}

        {!isLoading && isError && (
          <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
            <p className="text-xs">Failed to load meetings</p>
          </div>
        )}

        {!isLoading && !isError && todayMeetings.length === 0 && (
          <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
            <Clock className="w-7 h-7 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No meetings today</p>
          </div>
        )}

        {!isLoading && !isError &&
          todayMeetings.map((meeting, i) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: i * 0.04,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              className="group flex items-center gap-3 px-4 py-3
                         bg-white dark:bg-neutral-900
                         border border-neutral-100 dark:border-neutral-800
                         hover:border-neutral-200 dark:hover:border-neutral-700
                         hover:shadow-sm rounded-xl cursor-pointer transition-all duration-200"
            >
              {/* Time */}
              <div className="shrink-0 text-right w-14">
                <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  {meeting.time}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-0.5">
                  {meeting.duration}
                </p>
              </div>

              <div className="w-px h-7 bg-neutral-200 dark:bg-neutral-700 shrink-0" />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {meeting.title}
                </p>
                <span
                  className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getStatusStyle(meeting.status)}`}
                >
                  {getStatusLabel(meeting.status)}
                </span>
              </div>

              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
            </motion.div>
          ))}
      </div>
    </div>
  );
}
