import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import { Mic, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { StartMeetingFab } from '@/components/home/StartMeetingFab';
import { useVoiceNotes } from '@/hooks/queries/useMeetingQueries';
import { toDisplayMeeting } from '@/lib/meetingHelpers';
import type { TranscriptionStatus } from '@/types';

function TranscriptBadge({ status }: { status: TranscriptionStatus }) {
  if (status === 'COMPLETED')
    return (
      <span className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500">
        <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
        Transcribed
      </span>
    );
  if (status === 'PROCESSING' || status === 'UPLOADED')
    return (
      <span className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        Processing
      </span>
    );
  if (status === 'FAILED')
    return (
      <span className="flex items-center gap-1 text-[10px] text-red-400 dark:text-red-500">
        <AlertCircle className="w-3 h-3" />
        Failed
      </span>
    );
  return null;
}

function groupByDate(notes: ReturnType<typeof toDisplayMeeting>[]) {
  const groups: Record<string, typeof notes> = {};
  for (const n of notes) {
    if (!groups[n.date]) groups[n.date] = [];
    groups[n.date].push(n);
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, items]) => {
      let label: string;
      if (date === todayStr) label = 'Today';
      else if (date === yesterdayStr) label = 'Yesterday';
      else
        label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      return { label, date, notes: items };
    });
}

export default function VoiceNotes() {
  const navigate = useNavigate();
  const { data: rawNotes, isLoading } = useVoiceNotes();

  const notes = useMemo(
    () => (rawNotes ?? []).map(toDisplayMeeting),
    [rawNotes]
  );

  const grouped = useMemo(() => groupByDate(notes), [notes]);

  let globalIndex = 0;

  return (
    <PageMotion>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
              Voice Notes
            </h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              {isLoading
                ? '—'
                : `${notes.length} recording${notes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-7 pb-24">
          {isLoading && (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && grouped.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Mic className="w-9 h-9 mx-auto text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                No voice notes yet
              </p>
              <p className="text-xs text-neutral-300 dark:text-neutral-600 mt-1">
                Tap the mic in the FAB to record one
              </p>
            </motion.div>
          )}

          {grouped.map((group) => (
            <div key={group.date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.12em]">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
              </div>

              {/* Note cards */}
              <div className="space-y-2">
                {group.notes.map((note) => {
                  const idx = globalIndex++;

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.28,
                        delay: idx * 0.04,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      onClick={() => navigate(`/meetings/${note.id}`)}
                      className="group bg-white dark:bg-neutral-900 rounded-xl border cursor-pointer
                                border-neutral-100 dark:border-neutral-800
                                hover:border-neutral-200 dark:hover:border-neutral-700
                                hover:shadow-sm transition-all duration-200"
                    >
                      <div className="px-4 py-3.5 flex items-center gap-3">
                        {/* Mic icon */}
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          <Mic className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 truncate">
                            {note.title}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                              <Clock className="w-3 h-3" />
                              {note.time} · {note.duration}
                            </span>
                            <TranscriptBadge
                              status={note._raw.transcriptionStatus}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <StartMeetingFab />
      </div>
    </PageMotion>
  );
}
