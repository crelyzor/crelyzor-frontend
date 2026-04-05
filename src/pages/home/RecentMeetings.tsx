import { useState } from 'react';
import {
  Mic,
  FileText,
  ClipboardList,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryStyle } from '@/constants';
import { useVoiceNotes } from '@/hooks/queries/useMeetingQueries';
import { formatMeetingDuration } from '@/types';
import type { DisplayMeeting } from '@/lib/meetingHelpers';

type Props = {
  meetings: DisplayMeeting[];
  isLoading?: boolean;
  isError?: boolean;
};

function relDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const diffDays = Math.floor(
    (new Date(today.toDateString()).getTime() -
      new Date(date.toDateString()).getTime()) /
      86400000
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
      <div className="shrink-0 w-14 space-y-1.5">
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-10 ml-auto" />
        <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded w-7 ml-auto" />
      </div>
      <div className="w-px h-7 bg-neutral-100 dark:bg-neutral-800" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-2/3" />
        <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded w-1/4" />
      </div>
    </div>
  );
}

export function RecentMeetings({ meetings, isLoading, isError }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'meetings' | 'voice-notes'>('meetings');

  const { data: allNotes, isLoading: notesLoading } = useVoiceNotes();
  const notes = (allNotes ?? []).slice(0, 5);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        {/* Tab toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setTab('meetings')}
            className={`relative px-3 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
              tab === 'meetings'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            Meetings
          </button>
          <button
            onClick={() => setTab('voice-notes')}
            className={`relative px-3 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
              tab === 'voice-notes'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            Voice Notes
          </button>
        </div>

        <button
          onClick={() => navigate(tab === 'meetings' ? '/meetings' : '/voice-notes')}
          className="flex items-center gap-0.5 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
        >
          See all
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'meetings' ? (
          <motion.div
            key="meetings"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="divide-y divide-neutral-50 dark:divide-neutral-800/60"
          >
            {isLoading && [1, 2, 3, 4, 5].map((i) => <RowSkeleton key={i} />)}

            {isError && (
              <div className="py-10 text-center">
                <p className="text-xs text-neutral-400">Failed to load meetings</p>
              </div>
            )}

            {!isLoading && !isError && meetings.length === 0 && (
              <div className="py-10 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-neutral-300 dark:text-neutral-700" />
                <p className="text-xs text-neutral-400 dark:text-neutral-600">
                  No recent meetings
                </p>
              </div>
            )}

            {!isLoading &&
              !isError &&
              meetings.map((meeting, i) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: i * 0.04,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                  className="group flex items-center gap-4 px-4 py-3.5
                             hover:bg-neutral-50 dark:hover:bg-neutral-800/50
                             cursor-pointer transition-colors duration-150"
                >
                  <div className="shrink-0 text-right w-14">
                    <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {relDate(meeting._raw.startTime ?? meeting.date)}
                    </p>
                    <p className="text-[9px] text-neutral-300 dark:text-neutral-600 mt-0.5">
                      {meeting.time}
                    </p>
                  </div>

                  <div className="w-px h-7 bg-neutral-100 dark:bg-neutral-800 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                      {meeting.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        {meeting.hasRecording && (
                          <Mic className="w-2.5 h-2.5 text-neutral-300 dark:text-neutral-600" />
                        )}
                        {meeting.hasTranscript && (
                          <FileText className="w-2.5 h-2.5 text-neutral-300 dark:text-neutral-600" />
                        )}
                        {meeting.hasTasks && (
                          <ClipboardList className="w-2.5 h-2.5 text-neutral-300 dark:text-neutral-600" />
                        )}
                      </div>
                      <span className="text-[9px] text-neutral-300 dark:text-neutral-600">
                        {meeting.duration}
                      </span>
                    </div>
                  </div>

                  {meeting.category && (
                    <span
                      className={`shrink-0 text-[9px] font-medium px-2 py-0.5 rounded-md border ${getCategoryStyle(meeting.category)}`}
                    >
                      {meeting.category}
                    </span>
                  )}

                  <ArrowUpRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 shrink-0" />
                </motion.div>
              ))}
          </motion.div>
        ) : (
          <motion.div
            key="voice-notes"
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
            className="p-2"
          >
            {notesLoading && (
              <div className="space-y-1 animate-pulse p-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                  />
                ))}
              </div>
            )}

            {!notesLoading && notes.length === 0 && (
              <div className="py-8 text-center">
                <Mic className="w-5 h-5 mx-auto mb-1.5 text-neutral-200 dark:text-neutral-700" />
                <p className="text-[11px] text-neutral-400 dark:text-neutral-600">
                  No voice notes yet
                </p>
              </div>
            )}

            {!notesLoading &&
              notes.map((note, i) => (
                <motion.button
                  key={note.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() => navigate(`/meetings/${note.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                             hover:bg-neutral-50 dark:hover:bg-neutral-800/60
                             transition-colors duration-150 text-left group"
                >
                  <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Mic className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {note.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500">
                        {relDate(note.startTime)}
                      </span>
                      {note.endTime && (
                        <>
                          <span className="text-[9px] text-neutral-200 dark:text-neutral-700">·</span>
                          <Clock className="w-2 h-2 text-neutral-300 dark:text-neutral-600" />
                          <span className="text-[9px] text-neutral-400 dark:text-neutral-500">
                            {formatMeetingDuration(note)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
