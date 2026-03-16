import {
  Clock,
  Mic,
  ClipboardList,
  FileText,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getCategoryStyle } from '@/constants';
import type { DisplayMeeting } from '@/lib/meetingHelpers';

type RecentMeetingsProps = {
  meetings: DisplayMeeting[];
  isLoading?: boolean;
  isError?: boolean;
};

function MeetingRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl animate-pulse">
      {/* Time column */}
      <div className="shrink-0 w-16 space-y-1.5">
        <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-10 ml-auto" />
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-8 ml-auto" />
      </div>
      {/* Divider */}
      <div className="w-px h-8 bg-neutral-100 dark:bg-neutral-800 shrink-0" />
      {/* Content */}
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3" />
      </div>
    </div>
  );
}

export function RecentMeetings({ meetings, isLoading, isError }: RecentMeetingsProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] tracking-[0.15em] text-neutral-400 dark:text-neutral-500 font-medium uppercase">
          Recent Meetings
        </h2>
        <button
          onClick={() => navigate('/meetings')}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-medium cursor-pointer group"
        >
          See all
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="space-y-2">
        {isLoading && (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <MeetingRowSkeleton key={i} />
            ))}
          </>
        )}

        {!isLoading && !isError &&
          meetings.map((meeting, i) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: i * 0.04,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              className="group flex items-center gap-4 px-4 py-3.5
                         bg-white dark:bg-neutral-900
                         border border-neutral-100 dark:border-neutral-800
                         hover:border-neutral-200 dark:hover:border-neutral-700
                         hover:shadow-sm
                         rounded-xl cursor-pointer transition-all duration-200"
            >
              {/* Time column */}
              <div className="shrink-0 text-right w-16">
                <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  {meeting.time}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-0.5">
                  {meeting.duration}
                </p>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700 shrink-0" />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                  {meeting.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {meeting.location && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[120px]">
                        {meeting.location}
                      </span>
                    </div>
                  )}
                  {/* SMA indicators */}
                  <div className="flex items-center gap-1 ml-0.5">
                    {meeting.hasRecording && (
                      <Mic className="w-2.5 h-2.5 text-neutral-400 dark:text-neutral-500" />
                    )}
                    {meeting.hasTranscript && (
                      <FileText className="w-2.5 h-2.5 text-neutral-400 dark:text-neutral-500" />
                    )}
                    {meeting.hasTasks && (
                      <ClipboardList className="w-2.5 h-2.5 text-neutral-400 dark:text-neutral-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Category badge */}
              {meeting.category && (
                <span
                  className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border ${getCategoryStyle(meeting.category)}`}
                >
                  {meeting.category}
                </span>
              )}

              {/* Arrow on hover */}
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
            </motion.div>
          ))}

        {isError && (
          <div className="text-center py-10 text-neutral-400 dark:text-neutral-600">
            <p className="text-xs">Failed to load meetings</p>
          </div>
        )}

        {!isLoading && !isError && meetings.length === 0 && (
          <div className="text-center py-10 text-neutral-400 dark:text-neutral-600">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No recent meetings</p>
          </div>
        )}
      </div>
    </div>
  );
}
