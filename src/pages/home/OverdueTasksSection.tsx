import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useUpdateTask } from '@/hooks/queries/useSMAQueries';
import type { TaskWithMeeting } from '@/services/smaService';

type Props = {
  tasks: TaskWithMeeting[];
};

export function OverdueTasksSection({ tasks }: Props) {
  const navigate = useNavigate();
  const updateTask = useUpdateTask();

  if (tasks.length === 0) return null;

  const visible = tasks.slice(0, 3);
  const hasMore = tasks.length > 3;

  const handleComplete = (taskId: string) => {
    updateTask.mutate({ taskId, data: { isCompleted: true } });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
          <h2 className="text-[11px] tracking-[0.15em] text-neutral-400 dark:text-neutral-500 font-medium uppercase">
            Overdue
          </h2>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
            {tasks.length}
          </span>
        </div>
        {hasMore && (
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-medium cursor-pointer group"
          >
            See all
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Rows */}
      <div className="space-y-1.5">
        {visible.map((task, i) => (
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
                       border-l-2 border-l-neutral-400 dark:border-l-neutral-500
                       hover:border-neutral-200 dark:hover:border-neutral-700
                       rounded-xl transition-[border-color,box-shadow] duration-200"
          >
            {/* Complete button */}
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-0 h-auto w-auto"
              onClick={() => handleComplete(task.id)}
              aria-label="Mark complete"
            />

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
                {task.dueDate && (
                  <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                    Due{' '}
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
