import { CheckSquare, ArrowUpRight, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useUpdateTask } from '@/hooks/queries/useSMAQueries';
import { queryKeys } from '@/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import type { TaskWithMeeting } from '@/services/smaService';

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-red-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-neutral-300 dark:bg-neutral-600',
};

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl animate-pulse">
      <div className="w-3.5 h-3.5 rounded-full bg-neutral-100 dark:bg-neutral-800 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3" />
      </div>
    </div>
  );
}

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
          if (meetingId) {
            qc.invalidateQueries({ queryKey: queryKeys.sma.tasks(meetingId) });
          }
        },
      }
    );
  };

  const visible = tasks.slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
          <h2 className="text-[11px] tracking-[0.15em] text-neutral-400 dark:text-neutral-500 font-medium uppercase">
            Pending Tasks
          </h2>
          {!isLoading && tasks.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
              {tasks.length}
            </span>
          )}
        </div>
        {tasks.length > 5 && (
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-medium cursor-pointer group"
          >
            See all
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {isLoading && [1, 2, 3].map((i) => <RowSkeleton key={i} />)}

        {!isLoading && visible.length === 0 && (
          <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
            <CheckSquare className="w-7 h-7 mx-auto mb-2 opacity-40" />
            <p className="text-xs">All caught up</p>
          </div>
        )}

        {!isLoading &&
          visible.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.22,
                delay: i * 0.03,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="group flex items-start gap-3 px-4 py-3
                         bg-white dark:bg-neutral-900
                         border border-neutral-100 dark:border-neutral-800
                         hover:border-neutral-200 dark:hover:border-neutral-700
                         rounded-xl transition-all duration-200"
            >
              {/* Complete button */}
              <button
                onClick={() => handleComplete(task.id, task.meetingId)}
                className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center"
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
                <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.meeting && (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate max-w-[140px]">
                      {task.meeting.title}
                    </span>
                  )}
                  {task.priority && (
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? ''}`}
                    />
                  )}
                  {task.dueDate && (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
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
    </div>
  );
}
