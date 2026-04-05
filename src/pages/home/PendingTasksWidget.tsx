import { CheckSquare, ArrowUpRight, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useUpdateTask } from '@/hooks/queries/useSMAQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { TaskWithMeeting } from '@/services/smaService';

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: 'border-l-amber-400 dark:border-l-amber-500',
  MEDIUM: 'border-l-neutral-400 dark:border-l-neutral-500',
  LOW: 'border-l-neutral-200 dark:border-l-neutral-700',
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-amber-400',
  MEDIUM: 'bg-neutral-400 dark:bg-neutral-500',
  LOW: 'bg-neutral-200 dark:bg-neutral-700',
};

type Props = {
  tasks: TaskWithMeeting[];
  isLoading?: boolean;
};

export function PendingTasksWidget({ tasks, isLoading }: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const updateTask = useUpdateTask('');

  const handleComplete = (taskId: string, meetingId: string | null) => {
    updateTask.mutate(
      { taskId, data: { isCompleted: true } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: queryKeys.sma.allTasks() });
          if (meetingId)
            qc.invalidateQueries({ queryKey: queryKeys.sma.tasks(meetingId) });
        },
      }
    );
  };

  const visible = tasks.slice(0, 6);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
            Pending Tasks
          </span>
          {!isLoading && tasks.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
              {tasks.length}
            </span>
          )}
        </div>
        {tasks.length > 6 && (
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-0.5 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
          >
            See all
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}
      </div>

      <div className="p-2">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-1 p-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && visible.length === 0 && (
          <div className="py-8 text-center">
            <CheckSquare className="w-6 h-6 mx-auto mb-2 text-neutral-200 dark:text-neutral-700" />
            <p className="text-xs text-neutral-400 dark:text-neutral-600">
              All caught up
            </p>
          </div>
        )}

        {/* Tasks */}
        {!isLoading &&
          visible.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: i * 0.04,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={`group flex items-start gap-3 px-3 py-2.5
                         rounded-xl border-l-[2px]
                         border border-transparent
                         hover:bg-neutral-50 dark:hover:bg-neutral-800/60
                         hover:border-neutral-100 dark:hover:border-neutral-800
                         transition-all duration-150
                         ${task.priority ? (PRIORITY_BORDER[task.priority] ?? '') : 'border-l-neutral-100 dark:border-l-neutral-800'}`}
            >
              {/* Complete button */}
              <button
                onClick={() => handleComplete(task.id, task.meetingId)}
                className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center"
                aria-label="Mark complete"
              >
                <Circle className="w-2 h-2 text-transparent" />
              </button>

              {/* Content */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() =>
                  task.meetingId
                    ? navigate(`/meetings/${task.meetingId}`)
                    : navigate('/tasks')
                }
              >
                <p className="text-[13px] text-neutral-900 dark:text-neutral-100 leading-snug truncate">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.meeting && (
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 truncate max-w-[120px]">
                      {task.meeting.title}
                    </span>
                  )}
                  {task.priority && (
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? ''}`}
                    />
                  )}
                  {task.dueDate && (
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500">
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Footer CTA */}
      {!isLoading && tasks.length > 0 && (
        <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <button
            onClick={() => navigate('/tasks')}
            className="w-full text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors text-center"
          >
            Open full task list →
          </button>
        </div>
      )}
    </div>
  );
}
