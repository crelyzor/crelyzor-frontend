import { useState } from 'react';
import { Sparkles, X, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import type { TaskWithMeeting } from '@/services/smaService';

// Module-level dismissed set — persists for SPA lifetime, resets on page refresh.
// This is intentional: banners reappear on refresh (still within 48h window),
// but don't flicker back if the user navigates away and returns within the same session.
const dismissedMeetingIds = new Set<string>();

type MeetingGroup = {
  meetingId: string;
  meetingTitle: string;
  tasks: TaskWithMeeting[];
};

type Props = {
  tasks: TaskWithMeeting[];
};

export function NewAITasksBanner({ tasks }: Props) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(
    () => new Set(dismissedMeetingIds)
  );

  // Group tasks by meeting
  const groups = tasks.reduce<MeetingGroup[]>((acc, task) => {
    if (!task.meetingId || !task.meeting) return acc;
    const existing = acc.find((g) => g.meetingId === task.meetingId);
    if (existing) {
      existing.tasks.push(task);
    } else {
      acc.push({
        meetingId: task.meetingId,
        meetingTitle: task.meeting.title,
        tasks: [task],
      });
    }
    return acc;
  }, []);

  const visibleGroups = groups.filter((g) => !dismissed.has(g.meetingId));

  if (visibleGroups.length === 0) return null;

  const handleDismiss = (meetingId: string) => {
    dismissedMeetingIds.add(meetingId);
    setDismissed(new Set(dismissedMeetingIds));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
        <h2 className="text-[11px] tracking-[0.15em] text-neutral-400 dark:text-neutral-500 font-medium uppercase">
          New from AI
        </h2>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {visibleGroups.map((group, i) => (
            <motion.div
              key={group.meetingId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{
                duration: 0.2,
                delay: i * 0.03,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex items-start gap-3 px-4 py-3
                         bg-white dark:bg-neutral-900
                         border border-neutral-100 dark:border-neutral-800
                         border-l-2 border-l-neutral-300 dark:border-l-neutral-600
                         rounded-xl"
            >
              <div className="flex-1 min-w-0">
                {/* Meeting name + count badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {group.meetingTitle}
                  </p>
                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    {group.tasks.length} task
                    {group.tasks.length !== 1 ? 's' : ''} from AI
                  </span>
                </div>

                {/* Task title previews */}
                <div className="mt-1.5 space-y-0.5">
                  {group.tasks.slice(0, 2).map((task) => (
                    <p
                      key={task.id}
                      className="text-xs text-neutral-500 dark:text-neutral-400 truncate"
                    >
                      · {task.title}
                    </p>
                  ))}
                  {group.tasks.length > 2 && (
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      +{group.tasks.length - 2} more
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                <button
                  onClick={() => navigate(`/meetings/${group.meetingId}`)}
                  className="flex items-center gap-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-medium"
                >
                  View
                  <ArrowUpRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDismiss(group.meetingId)}
                  className="text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
