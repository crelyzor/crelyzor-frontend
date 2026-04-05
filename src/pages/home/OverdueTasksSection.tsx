import { AlertCircle, ArrowUpRight, CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/15 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-amber-100 dark:border-amber-900/30">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="text-[10px] tracking-[0.18em] text-amber-600 dark:text-amber-500 uppercase font-medium">
            Overdue
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400">
            {tasks.length}
          </span>
        </div>
        {hasMore && (
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-0.5 text-[10px] text-amber-500 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium"
          >
            See all
            <ArrowUpRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Tasks */}
      <div className="divide-y divide-amber-100 dark:divide-amber-900/20">
        {visible.map((task) => (
          <div key={task.id} className="group flex items-center gap-3 px-5 py-2.5">
            <button
              onClick={() => updateTask.mutate({ taskId: task.id, data: { isCompleted: true } })}
              className="shrink-0 w-3.5 h-3.5 rounded-full border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors flex items-center justify-center"
              aria-label="Mark complete"
            >
              <CircleDot className="w-2 h-2 text-amber-400 dark:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() =>
                task.meetingId ? navigate(`/meetings/${task.meetingId}`) : navigate('/tasks')
              }
            >
              <p className="text-[13px] text-amber-900 dark:text-amber-200 truncate">
                {task.title}
              </p>
              {task.dueDate && (
                <p className="text-[9px] text-amber-500 dark:text-amber-600 mt-0.5">
                  Due{' '}
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
