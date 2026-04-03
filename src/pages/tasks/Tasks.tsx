import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import {
  CheckSquare,
  Plus,
  Check,
  CalendarDays,
  Trash2,
  ArrowUpDown,
  Tag,
  AlertCircle,
  List,
  LayoutGrid,
  Rows3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import {
  useAllTasks,
  useCreateStandaloneTask,
  useUpdateTask,
  useDeleteTask,
  useReorderTasks,
} from '@/hooks/queries/useSMAQueries';
import { useUserTags } from '@/hooks/queries/useTagQueries';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { TaskSidebar } from './components/TaskSidebar';
import { TaskBoardView } from './components/TaskBoardView';
import { TaskListView } from './components/TaskListView';
import { parseTaskInput } from '@/lib/parseTaskInput';
import { PRIORITY_LABELS, PRIORITY_STYLES } from '@/constants/task';
import type {
  TaskListParams,
  TaskWithMeeting,
  TaskView,
} from '@/services/smaService';

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-red-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-neutral-300 dark:bg-neutral-600',
};

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: 'border-l-[3px] border-l-red-400',
  MEDIUM: 'border-l-[3px] border-l-amber-400',
  LOW: '',
};

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

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
] as const;

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date created' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
] as const;

const VIEW_LABELS: Record<TaskView, string> = {
  inbox: 'Inbox',
  today: 'Today',
  upcoming: 'Upcoming',
  all: 'All Tasks',
  from_meetings: 'From Meetings',
};

// Views that use status/source/sort filter bar
const FILTERABLE_VIEWS: TaskView[] = ['all'];

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
  onSelect,
  isSelected,
}: {
  task: TaskWithMeeting;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onNavigate: (meetingId: string) => void;
  onSelect: (task: TaskWithMeeting) => void;
  isSelected: boolean;
}) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isOverdue =
    task.dueDate && !task.isCompleted && new Date(task.dueDate) < startOfToday;

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
      onClick={() => onSelect(task)}
      className={`group flex items-start gap-3 px-4 py-3.5 cursor-pointer
                 bg-white dark:bg-neutral-900
                 border border-neutral-100 dark:border-neutral-800
                 hover:border-neutral-200 dark:hover:border-neutral-700
                 rounded-xl transition-[border-color,box-shadow] duration-200
                 ${task.priority ? (PRIORITY_BORDER[task.priority] ?? '') : ''}
                 ${isSelected ? 'ring-1 ring-neutral-300 dark:ring-neutral-600 border-neutral-200 dark:border-neutral-700' : ''}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id, !task.isCompleted);
        }}
        className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
          task.isCompleted
            ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400'
        }`}
        aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.isCompleted && (
          <Check className="w-2.5 h-2.5 text-white dark:text-neutral-900" />
        )}
      </button>

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
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(task.meeting!.id);
              }}
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
          {isOverdue && (
            <span className="flex items-center gap-0.5 text-[10px] text-red-400 dark:text-red-500">
              <AlertCircle className="w-2.5 h-2.5" />
              Overdue
            </span>
          )}
          {task.dueDate && !isOverdue && (
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

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
        aria-label="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
      </button>
    </motion.div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <span className="text-[10px] uppercase tracking-wider font-medium text-neutral-400 dark:text-neutral-500">
        {label}
      </span>
      <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
    </div>
  );
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function Tasks() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = (searchParams.get('view') as TaskView | null) ?? 'all';

  const [status, setStatus] = useState<'all' | 'completed' | 'pending'>(
    'pending'
  );
  const [priority, setPriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH' | undefined
  >();
  const [source, setSource] = useState<'AI_EXTRACTED' | 'MANUAL' | undefined>();
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithMeeting | null>(
    null
  );
  const [displayMode, setDisplayMode] = useState<'list' | 'board' | 'grouped'>(
    'list'
  );

  const { data: userTags } = useUserTags();

  const handleViewChange = useCallback(
    (newView: TaskView) => {
      setSearchParams({ view: newView });
      setSelectedTask(null);
      if (newView !== 'inbox' && newView !== 'all') setDisplayMode('list');
    },
    [setSearchParams]
  );

  // Derive query params from active view
  const params: TaskListParams = useMemo(() => {
    // Board + grouped modes always fetch all statuses
    if (displayMode === 'board' || displayMode === 'grouped') {
      return {
        status: 'all',
        ...(priority && { priority }),
        ...(source && { source }),
        limit: 200,
      };
    }
    switch (view) {
      case 'inbox':
        return { view: 'inbox', limit: 100 };
      case 'today':
        return {
          view: 'today',
          sortBy: 'dueDate',
          sortOrder: 'asc',
          limit: 100,
        };
      case 'upcoming':
        return {
          view: 'upcoming',
          sortBy: 'dueDate',
          sortOrder: 'asc',
          limit: 100,
        };
      case 'from_meetings':
        return { view: 'from_meetings', limit: 100 };
      case 'all':
      default:
        return {
          status,
          ...(priority && { priority }),
          ...(source && { source }),
          sortBy,
          sortOrder,
          limit: 100,
        };
    }
  }, [view, status, priority, source, sortBy, sortOrder, displayMode]);

  const { data, isLoading, isError, refetch } = useAllTasks(params);

  // Badge counts — one separate query for all pending tasks, computed client-side
  const { data: badgeData } = useAllTasks({ status: 'pending', limit: 500 });
  const navCounts = useMemo(() => {
    const allPending = badgeData?.tasks ?? [];
    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);
    const sevenDaysFromNow = new Date(startOfToday);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    let inbox = 0;
    let today = 0;
    let upcoming = 0;
    for (const t of allPending) {
      if (!t.dueDate && !t.scheduledTime) {
        inbox++;
      } else if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d <= endOfToday) today++;
        else if (d <= sevenDaysFromNow) upcoming++;
      }
    }
    return { inbox, today, upcoming };
  }, [badgeData?.tasks, startOfToday]);

  const createTask = useCreateStandaloneTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();

  const total = data?.pagination?.total ?? 0;

  // Flat tasks list for non-grouped views
  const tasks = useMemo(() => {
    const flat = data?.tasks ?? [];
    if (selectedTagIds.size === 0) return flat;
    return flat.filter((t) =>
      t.tags?.some((tag) => selectedTagIds.has(tag.id))
    );
  }, [data?.tasks, selectedTagIds]);

  // Keep selected task in sync — search flat list AND grouped data
  const liveSelectedTask = useMemo(() => {
    if (!selectedTask) return null;
    const flat = tasks.find((t) => t.id === selectedTask.id);
    if (flat) return flat;
    if (data?.grouped) {
      for (const group of data.grouped) {
        const found = group.tasks.find((t) => t.id === selectedTask.id);
        if (found) return found;
      }
    }
    return selectedTask;
  }, [tasks, data?.grouped, selectedTask]);

  // NL parse — derived live from the inline create input
  const parsed = useMemo(
    () => (newTaskTitle.trim() ? parseTaskInput(newTaskTitle.trim()) : null),
    [newTaskTitle]
  );

  const handleCreate = useCallback(() => {
    if (!parsed) return;
    createTask.mutate(
      {
        title: parsed.title,
        priority: parsed.priority,
        dueDate: parsed.dueDate,
      },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setShowCreate(false);
        },
      }
    );
  }, [parsed, createTask]);

  const handleToggle = useCallback(
    (taskId: string, isCompleted: boolean) => {
      updateTask.mutate({ taskId, data: { isCompleted } });
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    (taskId: string) => {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          if (selectedTask?.id === taskId) setSelectedTask(null);
        },
      });
    },
    [deleteTask, selectedTask]
  );

  const toggleSortOrder = () =>
    setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));

  const showFilterBar = FILTERABLE_VIEWS.includes(view);

  // Today view: split into overdue + due today
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const endOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const { overdueTasks, dueTodayTasks } = useMemo(() => {
    if (view !== 'today') return { overdueTasks: [], dueTodayTasks: [] };
    const overdue: TaskWithMeeting[] = [];
    const dueToday: TaskWithMeeting[] = [];
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const d = new Date(t.dueDate);
      if (d < startOfToday) overdue.push(t);
      else if (d <= endOfToday) dueToday.push(t);
    }
    return { overdueTasks: overdue, dueTodayTasks: dueToday };
  }, [view, tasks, startOfToday, endOfToday]);

  // From Meetings: group by meeting
  const meetingGroups = useMemo(() => {
    if (view !== 'from_meetings') return [];
    const map = new Map<
      string,
      { meetingId: string; title: string; tasks: TaskWithMeeting[] }
    >();
    for (const t of tasks) {
      if (!t.meeting) continue; // guard: backend guarantees meetingId != null for this view, but relation may not be populated
      const key = t.meeting.id;
      if (!map.has(key)) {
        map.set(key, { meetingId: key, title: t.meeting.title, tasks: [] });
      }
      map.get(key)!.tasks.push(t);
    }
    return Array.from(map.values());
  }, [view, tasks]);

  // Grouped view: time-bucket sections sourced from tag-filtered `tasks`
  const groupedBuckets = useMemo(() => {
    if (displayMode !== 'grouped') return null;

    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const endOfTomorrow = new Date(startOfTomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const endOfThisWeek = new Date(startOfToday);
    endOfThisWeek.setDate(endOfThisWeek.getDate() + 7);
    endOfThisWeek.setHours(23, 59, 59, 999);

    const buckets: { label: string; tasks: TaskWithMeeting[] }[] = [
      { label: 'Overdue', tasks: [] },
      { label: 'Today', tasks: [] },
      { label: 'Tomorrow', tasks: [] },
      { label: 'This Week', tasks: [] },
      { label: 'Later', tasks: [] },
      { label: 'No Date', tasks: [] },
    ];

    for (const t of tasks) {
      if (!t.dueDate) {
        buckets[5].tasks.push(t);
        continue;
      }
      const d = new Date(t.dueDate);
      if (d < startOfToday) buckets[0].tasks.push(t);
      else if (d <= endOfToday) buckets[1].tasks.push(t);
      else if (d <= endOfTomorrow) buckets[2].tasks.push(t);
      else if (d <= endOfThisWeek) buckets[3].tasks.push(t);
      else buckets[4].tasks.push(t);
    }

    return buckets.filter((b) => b.tasks.length > 0);
  }, [displayMode, tasks, startOfToday]);

  const isPanelOpen = !!liveSelectedTask;

  return (
    <PageMotion>
      <div
        className={`flex gap-8 transition-[padding] duration-200 ${isPanelOpen ? 'pr-[416px]' : ''}`}
      >
        {/* Sidebar */}
        <TaskSidebar
          activeView={view}
          onViewChange={handleViewChange}
          counts={navCounts}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                {VIEW_LABELS[view]}
              </h1>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                {isLoading ? '—' : `${total} task${total !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle — only for inbox + all views */}
              {(view === 'inbox' || view === 'all') && (
                <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDisplayMode('list')}
                    className={`transition-colors ${
                      displayMode === 'list'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm hover:bg-white dark:hover:bg-neutral-700'
                        : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDisplayMode('board')}
                    className={`transition-colors ${
                      displayMode === 'board'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm hover:bg-white dark:hover:bg-neutral-700'
                        : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                    aria-label="Board view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDisplayMode('grouped')}
                    className={`transition-colors ${
                      displayMode === 'grouped'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm hover:bg-white dark:hover:bg-neutral-700'
                        : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                    aria-label="Grouped view"
                  >
                    <Rows3 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <Button
                size="sm"
                onClick={() => setShowCreate(true)}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New task
              </Button>
            </div>
          </div>

          {/* Filter bar — only for All view (hidden in board + grouped modes) */}
          {showFilterBar && displayMode === 'list' && (
            <>
              <div className="flex items-center gap-1 mb-4 flex-wrap">
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
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Priority + tag filter — shown for all views */}
          {!showFilterBar && priority !== undefined && (
            <div className="flex items-center gap-1 mb-4 flex-wrap">
              {PRIORITY_FILTERS.map((f) =>
                f.value === undefined ? null : (
                  <Button
                    key={f.value}
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
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${PRIORITY_DOT[f.value] ?? ''}`}
                    />
                    {f.label}
                  </Button>
                )
              )}
            </div>
          )}

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
                    className={`flex items-center gap-1 px-2.5 py-1 h-auto rounded-full text-[11px] font-medium transition-all duration-150 ${
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
                {/* NL parse preview */}
                {(parsed?.priority || parsed?.dueDateLabel) && (
                  <div className="flex items-center gap-1.5 px-4 pt-1.5 pb-1">
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      Will create:
                    </span>
                    {parsed.priority && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_STYLES[parsed.priority] ?? ''}`}
                      >
                        {PRIORITY_LABELS[parsed.priority]}
                      </span>
                    )}
                    {parsed.dueDateLabel && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        {parsed.dueDateLabel}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task list */}
          <div className="space-y-1.5 pb-24">
            {isLoading && [...Array(5)].map((_, i) => <RowSkeleton key={i} />)}

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

            {/* TODAY VIEW — overdue + due today sections */}
            {!isLoading && !isError && view === 'today' && (
              <AnimatePresence mode="popLayout">
                {overdueTasks.length === 0 && dueTodayTasks.length === 0 && (
                  <EmptyState
                    view="today"
                    onShowCreate={() => setShowCreate(true)}
                  />
                )}
                {overdueTasks.length > 0 && (
                  <>
                    <SectionHeader label="Overdue" />
                    {overdueTasks.map((task, i) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        index={i}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onNavigate={(id) => navigate(`/meetings/${id}`)}
                        onSelect={setSelectedTask}
                        isSelected={selectedTask?.id === task.id}
                      />
                    ))}
                  </>
                )}
                {dueTodayTasks.length > 0 && (
                  <>
                    <SectionHeader label="Due today" />
                    {dueTodayTasks.map((task, i) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        index={i}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onNavigate={(id) => navigate(`/meetings/${id}`)}
                        onSelect={setSelectedTask}
                        isSelected={selectedTask?.id === task.id}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            )}

            {/* UPCOMING VIEW — grouped by date */}
            {!isLoading && !isError && view === 'upcoming' && (
              <AnimatePresence mode="popLayout">
                {(!data?.grouped || data.grouped.length === 0) && (
                  <EmptyState
                    view="upcoming"
                    onShowCreate={() => setShowCreate(true)}
                  />
                )}
                {data?.grouped?.map((group) => (
                  <div key={group.date}>
                    <SectionHeader label={formatDateHeader(group.date)} />
                    {group.tasks.map((task, i) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        index={i}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onNavigate={(id) => navigate(`/meetings/${id}`)}
                        onSelect={setSelectedTask}
                        isSelected={selectedTask?.id === task.id}
                      />
                    ))}
                  </div>
                ))}
              </AnimatePresence>
            )}

            {/* FROM MEETINGS VIEW — grouped by meeting */}
            {!isLoading && !isError && view === 'from_meetings' && (
              <AnimatePresence mode="popLayout">
                {meetingGroups.length === 0 && (
                  <EmptyState
                    view="from_meetings"
                    onShowCreate={() => setShowCreate(true)}
                  />
                )}
                {meetingGroups.map((group) => (
                  <div key={group.meetingId}>
                    <SectionHeader label={group.title} />
                    {group.tasks.map((task, i) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        index={i}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onNavigate={(id) => navigate(`/meetings/${id}`)}
                        onSelect={setSelectedTask}
                        isSelected={selectedTask?.id === task.id}
                      />
                    ))}
                  </div>
                ))}
              </AnimatePresence>
            )}

            {/* INBOX / ALL — GROUPED VIEW */}
            {!isLoading &&
              !isError &&
              (view === 'inbox' || view === 'all') &&
              displayMode === 'grouped' && (
                <div className="space-y-1.5 pb-24">
                  {(!groupedBuckets || groupedBuckets.length === 0) && (
                    <EmptyState
                      view={view === 'inbox' ? 'inbox' : 'all'}
                      onShowCreate={() => setShowCreate(true)}
                    />
                  )}
                  {groupedBuckets?.map((bucket) => (
                    <div key={bucket.label}>
                      <SectionHeader label={bucket.label} />
                      <AnimatePresence mode="popLayout">
                        {bucket.tasks.map((task, i) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            index={i}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onNavigate={(id) => navigate(`/meetings/${id}`)}
                            onSelect={setSelectedTask}
                            isSelected={selectedTask?.id === task.id}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

            {/* INBOX / ALL — BOARD VIEW */}
            {!isLoading &&
              !isError &&
              (view === 'inbox' || view === 'all') &&
              displayMode === 'board' && (
                <TaskBoardView
                  tasks={tasks}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onNavigate={(id) => navigate(`/meetings/${id}`)}
                  onSelect={setSelectedTask}
                  selectedTaskId={selectedTask?.id ?? null}
                  updateTask={updateTask}
                />
              )}

            {/* INBOX VIEW — sortable list */}
            {!isLoading &&
              !isError &&
              view === 'inbox' &&
              displayMode === 'list' && (
                <>
                  {tasks.length === 0 && (
                    <EmptyState
                      view="inbox"
                      onShowCreate={() => setShowCreate(true)}
                    />
                  )}
                  {tasks.length > 0 && (
                    <TaskListView
                      tasks={tasks}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onNavigate={(id) => navigate(`/meetings/${id}`)}
                      onSelect={setSelectedTask}
                      selectedTaskId={selectedTask?.id ?? null}
                      reorderTasks={reorderTasks}
                    />
                  )}
                </>
              )}

            {/* ALL VIEW — non-sortable flat list */}
            {!isLoading &&
              !isError &&
              view === 'all' &&
              displayMode === 'list' && (
                <>
                  {tasks.length === 0 && (
                    <EmptyState
                      view={view}
                      hasFilters={
                        !!(priority || source || selectedTagIds.size > 0)
                      }
                      onClearFilters={() => {
                        setStatus('all');
                        setPriority(undefined);
                        setSource(undefined);
                        setSelectedTagIds(new Set());
                      }}
                      onShowCreate={() => setShowCreate(true)}
                    />
                  )}
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task, i) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        index={i}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onNavigate={(id) => navigate(`/meetings/${id}`)}
                        onSelect={setSelectedTask}
                        isSelected={selectedTask?.id === task.id}
                      />
                    ))}
                  </AnimatePresence>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <TaskDetailPanel
        task={liveSelectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </PageMotion>
  );
}

function EmptyState({
  view,
  hasFilters,
  onClearFilters,
  onShowCreate,
}: {
  view: TaskView;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onShowCreate: () => void;
}) {
  const messages: Record<TaskView, { title: string; sub: string }> = {
    inbox: {
      title: 'Inbox is clear',
      sub: 'Tasks without a due date live here',
    },
    today: { title: 'Nothing due today', sub: 'Enjoy the clear schedule' },
    upcoming: {
      title: 'Nothing coming up',
      sub: 'Tasks due in the next 7 days will appear here',
    },
    all: {
      title: 'No tasks yet',
      sub: 'Create your first task to get started',
    },
    from_meetings: {
      title: 'No tasks from meetings',
      sub: 'AI-extracted and manual tasks linked to meetings will appear here',
    },
  };

  const { title, sub } = messages[view];

  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <CheckSquare className="w-9 h-9 mx-auto text-neutral-200 dark:text-neutral-700 mb-3" />
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          No tasks match the current filters
        </p>
        <button
          onClick={onClearFilters}
          className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 mt-2 transition-colors"
        >
          Clear filters
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <CheckSquare className="w-9 h-9 mx-auto text-neutral-200 dark:text-neutral-700 mb-3" />
      <p className="text-sm text-neutral-400 dark:text-neutral-500">{title}</p>
      <p className="text-xs text-neutral-300 dark:text-neutral-600 mt-1">
        {sub}
      </p>
      {(view === 'all' || view === 'inbox') && (
        <Button size="sm" className="mt-4" onClick={onShowCreate}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New task
        </Button>
      )}
    </motion.div>
  );
}
