import { CheckSquare, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useUpdateTask } from '@/hooks/queries/useSMAQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { TaskWithMeeting } from '@/services/smaService';

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-amber-400 dark:bg-amber-500',
  MEDIUM: 'bg-neutral-300 dark:bg-neutral-600',
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

  const handleComplete = (e: React.MouseEvent, taskId: string, meetingId: string | null) => {
    e.stopPropagation();
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
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-0.5 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
        >
          See all
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
        {isLoading && (
          <div className="space-y-2 px-4 py-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-neutral-100 dark:bg-neutral-800 shrink-0" />
                <div className="flex-1 h-3 bg-neutral-100 dark:bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && visible.length === 0 && (
          <div className="py-10 text-center">
            <CheckSquare className="w-6 h-6 mx-auto mb-2 text-neutral-200 dark:text-neutral-700" />
            <p className="text-xs text-neutral-400 dark:text-neutral-600">All caught up</p>
          </div>
        )}

        {!isLoading &&
          visible.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() =>
                task.meetingId
                  ? navigate(`/meetings/${task.meetingId}`)
                  : navigate('/tasks')
              }
              className="group flex items-center gap-4 px-4 py-3.5 cursor-pointer
                         hover:bg-neutral-50 dark:hover:bg-neutral-800/50
                         transition-colors duration-150"
            >
              {/* Complete button */}
              <button
                onClick={(e) => handleComplete(e, task.id, task.meetingId)}
                className="shrink-0 w-4 h-4 rounded-full border-[1.5px] border-neutral-300 dark:border-neutral-600
                           hover:border-neutral-500 dark:hover:border-neutral-400
                           hover:bg-neutral-100 dark:hover:bg-neutral-800
                           transition-colors"
                aria-label="Mark complete"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.meeting && (
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 truncate max-w-[160px]">
                      {task.meeting.title}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-[9px] text-neutral-300 dark:text-neutral-600">
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Priority dot */}
              {task.priority && task.priority !== 'LOW' && (
                <span
                  className={`shrink-0 w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority] ?? ''}`}
                />
              )}
            </motion.div>
          ))}
      </div>

      {!isLoading && tasks.length > 6 && (
        <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <button
            onClick={() => navigate('/tasks')}
            className="w-full text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors text-center"
          >
            +{tasks.length - 6} more tasks →
          </button>
        </div>
      )}
    </div>
  );
}
