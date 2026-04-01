import { useState, useRef } from 'react';
import { CheckSquare, Square, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useCardTasks,
  useUpdateTask,
  useCreateStandaloneTask,
} from '@/hooks/queries/useSMAQueries';

function SkeletonRows() {
  return (
    <div className="space-y-1.5">
      {[70, 90, 55].map((w) => (
        <div key={w} className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse shrink-0" />
          <div
            className="h-3.5 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            style={{ width: `${w}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function CardTasksSection({ cardId }: { cardId: string }) {
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useCardTasks(cardId);
  const tasks = data?.tasks ?? [];

  const updateTask = useUpdateTask();
  const createTask = useCreateStandaloneTask();

  function handleToggle(taskId: string, isCompleted: boolean) {
    updateTask.mutate({ taskId, data: { isCompleted: !isCompleted } });
  }

  function handleCreate() {
    const title = newTitle.trim();
    if (!title) return;
    createTask.mutate(
      { title, cardId },
      {
        onSuccess: () => {
          setNewTitle('');
          inputRef.current?.focus();
        },
      }
    );
  }

  return (
    <div className="space-y-2">
      {/* Task rows */}
      {isLoading ? (
        <SkeletonRows />
      ) : tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">No tasks yet</p>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => handleToggle(task.id, task.isCompleted)}
              className="flex items-start gap-2 w-full text-left group py-0.5"
            >
              {task.isCompleted ? (
                <CheckSquare className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 mt-px" />
              ) : (
                <Square className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 dark:group-hover:text-neutral-500 shrink-0 mt-px transition-colors" />
              )}
              <span
                className={`text-sm leading-tight ${
                  task.isCompleted
                    ? 'line-through text-muted-foreground'
                    : 'text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {task.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Inline create */}
      <div className="flex items-center gap-1.5 pt-1">
        <input
          ref={inputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
          }}
          placeholder="Add a task…"
          maxLength={500}
          disabled={createTask.isPending}
          className="flex-1 text-sm bg-neutral-50 dark:bg-neutral-800/60 rounded-lg px-2.5 py-1.5 outline-none border border-transparent focus:border-neutral-200 dark:focus:border-neutral-700 placeholder:text-muted-foreground text-foreground min-w-0 disabled:opacity-50"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleCreate}
          disabled={!newTitle.trim() || createTask.isPending}
          className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Add task"
        >
          {createTask.isPending ? (
            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
