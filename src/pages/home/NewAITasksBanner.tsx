import { useState } from 'react';
import { Sparkles, X, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import type { TaskWithMeeting } from '@/services/smaService';

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

  const groups = tasks.reduce<MeetingGroup[]>((acc, task) => {
    if (!task.meetingId || !task.meeting) return acc;
    const existing = acc.find((g) => g.meetingId === task.meetingId);
    if (existing) existing.tasks.push(task);
    else
      acc.push({
        meetingId: task.meetingId,
        meetingTitle: task.meeting.title,
        tasks: [task],
      });
    return acc;
  }, []);

  const visibleGroups = groups.filter((g) => !dismissed.has(g.meetingId));
  if (visibleGroups.length === 0) return null;

  const handleDismiss = (meetingId: string) => {
    dismissedMeetingIds.add(meetingId);
    setDismissed(new Set(dismissedMeetingIds));
  };

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {visibleGroups.map((group) => (
          <motion.div
            key={group.meetingId}
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center gap-3 px-4 py-3
                       rounded-2xl border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900
                       border-l-[3px] border-l-neutral-400 dark:border-l-neutral-500"
          >
            <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {group.meetingTitle}
              </p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                {group.tasks.length} new task{group.tasks.length !== 1 ? 's' : ''} extracted by AI
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/meetings/${group.meetingId}`)}
                className="flex items-center gap-0.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                View
                <ArrowUpRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDismiss(group.meetingId)}
                className="text-neutral-300 dark:text-neutral-700 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
