import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import {
  CheckSquare,
  Plus,
  Circle,
  Check,
  CalendarDays,
  Trash2,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import {
  useAllTasks,
  useCreateStandaloneTask,
  useUpdateTask,
  useDeleteTask,
} from '@/hooks/queries/useSMAQueries';
import { useUserTags } from '@/hooks/queries/useTagQueries';
import type { TaskListParams, TaskWithMeeting } from '@/services/smaService';

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-red-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-neutral-300 dark:bg-neutral-600',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
] as const;

const PRIORITY_FILTERS = [
  { value: undefined, label: 'Any priority' },
  { value: 'HIGH' as const, label: 'High' },
  { value: 'MEDIUM' as const, label: 'Medium' },
  { value: 'LOW' as const, label: 'Low' },
];

const SOURCE_FILTERS = [
  { value: undefined, label: 'Any source' },
  { value: 'AI_EXTRACTED' as const, label: 'AI' },
  { value: 'MANUAL' as const, label: 'Manual' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date created' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
] as const;

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl animate-pulse">
      <div className="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-800 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3" />
      </div>
    </div>
  );
}

function TaskRow({
  task,
  index,
  onToggle,
  onDelete,
  onNavigate,
}: {
  task: TaskWithMeeting;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onNavigate: (meetingId: string) => void;
}) {
  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.22,
        delay: index * 0.02,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group flex items-start gap-3 px-4 py-3.5
                 bg-white dark:bg-neutral-900
                 border border-neutral-100 dark:border-neutral-800
                 hover:border-neutral-200 dark:hover:border-neutral-700
                 rounded-xl transition-[border-color,box-shadow] duration-200"
    >
      {/* Toggle */}
      <button
        onClick={() => onToggle(task.id, !task.isCompleted)}
        className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
          task.isCompleted
            ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400'
        }`}
        aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.isCompleted ? (
          <Check className="w-2.5 h-2.5 text-white dark:text-neutral-900" />
        ) : (
          <Circle className="w-2 h-2 text-transparent" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            task.isCompleted
              ? 'text-neutral-400 dark:text-neutral-500 line-through'
              : 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.meeting && (
            <button
              onClick={() => onNavigate(task.meeting!.id)}
              className="text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 truncate max-w-[160px] transition-colors"
            >
              {task.meeting.title}
            </button>
          )}
          {!task.meeting && task.source === 'MANUAL' && (
            <span className="text-[10px] text-neutral-300 dark:text-neutral-600">
              Standalone
            </span>
          )}
          {task.source === 'AI_EXTRACTED' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
              AI
            </span>
          )}
          {task.priority && (
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? ''}`}
            />
          )}
          {task.dueDate && (
            <span className="flex items-center gap-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
              <CalendarDays className="w-2.5 h-2.5" />
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          {task.tags?.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
        aria-label="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
      </button>
    </motion.div>
  );
}

export default function Tasks() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'all' | 'completed' | 'pending'>(
    'pending'
  );
  const [priority, setPriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH' | undefined
  >();
  const [source, setSource] = useState<
    'AI_EXTRACTED' | 'MANUAL' | undefined
  >();
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: userTags } = useUserTags();

  const params: TaskListParams = {
    status,
    ...(priority && { priority }),
    ...(source && { source }),
    sortBy,
    sortOrder,
    limit: 100,
  };

  const { data, isLoading, isError, refetch } = useAllTasks(params);
  const createTask = useCreateStandaloneTask();
  const updateTask = useUpdateTask('');
  const deleteTask = useDeleteTask('');

  const total = data?.pagination?.total ?? 0;

  const tasks = useMemo(() => {
    const allTasks = data?.tasks ?? [];
    if (selectedTagIds.size === 0) return allTasks;
    return allTasks.filter((t) =>
      t.tags?.some((tag) => selectedTagIds.has(tag.id))
    );
  }, [data?.tasks, selectedTagIds]);

  const handleCreate = useCallback(() => {
    const title = newTaskTitle.trim();
    if (!title) return;
    createTask.mutate(
      { title },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setShowCreate(false);
        },
      }
    );
  }, [newTaskTitle, createTask]);

  const handleToggle = useCallback(
    (taskId: string, isCompleted: boolean) => {
      updateTask.mutate({ taskId, data: { isCompleted } });
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    (taskId: string) => {
      deleteTask.mutate(taskId);
    },
    [deleteTask]
  );

  const toggleSortOrder = () =>
    setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));

  return (
    <PageMotion>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
              Tasks
            </h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              {isLoading ? '\u2014' : `${total} task${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New task
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 mb-4">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant="ghost"
              onClick={() => setStatus(f.value)}
              className={`px-3 py-1.5 h-auto rounded-full text-[11px] font-medium transition-all duration-150 ${
                status === f.value
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-100'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {f.label}
            </Button>
          ))}

          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

          {/* Priority filter */}
          {PRIORITY_FILTERS.map((f) =>
            f.value === undefined && !priority ? null : (
              <Button
                key={f.value ?? 'any-p'}
                variant="ghost"
                onClick={() =>
                  setPriority(priority === f.value ? undefined : f.value)
                }
                className={`px-2.5 py-1.5 h-auto rounded-full text-[11px] font-medium transition-all duration-150 ${
                  priority === f.value
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-100'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {f.value && (
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${PRIORITY_DOT[f.value] ?? ''}`}
                  />
                )}
                {f.label}
              </Button>
            )
          )}

          {!priority && (
            <Button
              variant="ghost"
              onClick={() => setPriority('HIGH')}
              className="px-2.5 py-1.5 h-auto rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              Priority
            </Button>
          )}

          {/* Source filter */}
          {SOURCE_FILTERS.map((f) =>
            f.value === undefined && !source ? null : (
              <Button
                key={f.value ?? 'any-s'}
                variant="ghost"
                onClick={() =>
                  setSource(source === f.value ? undefined : f.value)
                }
                className={`px-2.5 py-1.5 h-auto rounded-full text-[11px] font-medium transition-all duration-150 ${
                  source === f.value
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-100'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {f.label}
              </Button>
            )
          )}

          {!source && (
            <Button
              variant="ghost"
              onClick={() => setSource('AI_EXTRACTED')}
              className="px-2.5 py-1.5 h-auto rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              Source
            </Button>
          )}
        </div>

        {/* Sort bar */}
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpDown className="w-3 h-3 text-neutral-400" />
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (sortBy === opt.value) toggleSortOrder();
                else {
                  setSortBy(opt.value);
                  setSortOrder('desc');
                }
              }}
              className={`text-[11px] font-medium transition-colors ${
                sortBy === opt.value
                  ? 'text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              {opt.label}
              {sortBy === opt.value && (
                <span className="ml-0.5">
                  {sortOrder === 'desc' ? '\u2193' : '\u2191'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tag filter */}
        {userTags && userTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            <Tag className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
            {userTags.map((tag) => {
              const active = selectedTagIds.has(tag.id);
              return (
                <Button
                  key={tag.id}
                  variant="ghost"
                  onClick={() =>
                    setSelectedTagIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(tag.id)) next.delete(tag.id);
                      else next.add(tag.id);
                      return next;
                    })
                  }
                  className={`flex items-center gap-1 px-2.5 py-1 h-auto rounded-full text-[11px] font-medium transition-all duration-150
                    ${
                      active
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-100'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </Button>
              );
            })}
            {selectedTagIds.size > 0 && (
              <button
                onClick={() => setSelectedTagIds(new Set())}
                className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Inline create */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <Plus className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') {
                      setShowCreate(false);
                      setNewTaskTitle('');
                    }
                  }}
                  placeholder="What needs to be done?"
                  className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none"
                  autoFocus
                />
                <Button
                  size="xs"
                  onClick={handleCreate}
                  disabled={!newTaskTitle.trim() || createTask.isPending}
                >
                  {createTask.isPending ? 'Adding...' : 'Add'}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setShowCreate(false);
                    setNewTaskTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task list */}
        <div className="space-y-1.5 pb-24">
          {isLoading &&
            [...Array(5)].map((_, i) => <RowSkeleton key={i} />)}

          {isError && (
            <div className="text-center py-20">
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                Failed to load tasks
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !isError && tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <CheckSquare className="w-9 h-9 mx-auto text-neutral-200 dark:text-neutral-700 mb-3" />
              {status !== 'all' || priority || source || selectedTagIds.size > 0 ? (
                <>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500">
                    No tasks match the current filters
                  </p>
                  <button
                    onClick={() => {
                      setStatus('all');
                      setPriority(undefined);
                      setSource(undefined);
                      setSelectedTagIds(new Set());
                    }}
                    className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 mt-2 transition-colors"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500">
                    No tasks yet
                  </p>
                  <p className="text-xs text-neutral-300 dark:text-neutral-600 mt-1">
                    Create your first task to get started
                  </p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowCreate(true)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    New task
                  </Button>
                </>
              )}
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {!isLoading &&
              !isError &&
              tasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onNavigate={(id) => navigate(`/meetings/${id}`)}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>
    </PageMotion>
  );
}
