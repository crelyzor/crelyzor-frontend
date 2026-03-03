import { useNavigate } from 'react-router-dom';
import { Mic, Clock, ArrowUpRight } from 'lucide-react';
import { useVoiceNotes } from '@/hooks/queries/useMeetingQueries';
import { formatMeetingDuration } from '@/types';

function relativeDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const diffDays = Math.floor(
    (today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function RecentVoiceNotes() {
  const navigate = useNavigate();
  const { data: allNotes, isLoading } = useVoiceNotes();

  const notes = (allNotes ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Voice Notes
        </h3>
        <button
          onClick={() => navigate('/voice-notes')}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors group flex items-center gap-0.5"
        >
          <span className="text-[10px] font-medium">See all</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="px-2 pb-2">
        {isLoading && (
          <div className="space-y-1 px-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
                  <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Mic className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mb-2" />
            <p className="text-[11px] text-neutral-400 dark:text-neutral-600">
              No voice notes yet
            </p>
          </div>
        )}

        {!isLoading &&
          notes.map((note) => (
            <button
              key={note.id}
              onClick={() => navigate(`/meetings/${note.id}`)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-left group"
            >
              <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <Mic className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                  {note.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {relativeDate(note.startTime)}
                  </span>
                  {note.endTime && (
                    <>
                      <span className="text-[10px] text-neutral-300 dark:text-neutral-700">
                        ·
                      </span>
                      <Clock className="w-2.5 h-2.5 text-neutral-400 dark:text-neutral-500" />
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {formatMeetingDuration(note)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
