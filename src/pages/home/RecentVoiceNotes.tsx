import { useNavigate } from 'react-router-dom';
import { Mic, Clock, ArrowUpRight } from 'lucide-react';
import { useVoiceNotes } from '@/hooks/queries/useMeetingQueries';
import { formatMeetingDuration } from '@/types';

function relDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const diffDays = Math.floor(
    (new Date(today.toDateString()).getTime() - new Date(date.toDateString()).getTime()) /
      86400000
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentVoiceNotes() {
  const navigate = useNavigate();
  const { data: allNotes, isLoading } = useVoiceNotes();
  const notes = (allNotes ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Mic className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
            Voice Notes
          </span>
        </div>
        <button
          onClick={() => navigate('/voice-notes')}
          className="flex items-center gap-0.5 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
        >
          See all
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="p-2">
        {isLoading && (
          <div className="space-y-1 animate-pulse p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && notes.length === 0 && (
          <div className="py-6 text-center">
            <Mic className="w-5 h-5 mx-auto mb-1.5 text-neutral-200 dark:text-neutral-700" />
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                         hover:bg-neutral-50 dark:hover:bg-neutral-800/60
                         transition-colors duration-150 text-left group"
            >
              <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <Mic className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
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
            </button>
          ))}
      </div>
    </div>
  );
}
