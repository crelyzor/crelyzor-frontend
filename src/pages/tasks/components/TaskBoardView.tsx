import { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import {
  Check,
  CalendarDays,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TaskWithMeeting } from '@/services/smaService';
import type { useUpdateTask } from '@/hooks/queries/useSMAQueries';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Column {
  id: TaskStatus;
  label: string;
}

const COLUMNS: Column[] = [
  { id: 'TODO', label: 'Todo' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' },
];

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: 'border-l-[3px] border-l-red-400',
  MEDIUM: 'border-l-[3px] border-l-amber-400',
  LOW: '',
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-red-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-neutral-300 dark:bg-neutral-600',
};

interface TaskBoardViewProps {
  tasks: TaskWithMeeting[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onNavigate: (meetingId: string) => void;
  onSelect: (task: TaskWithMeeting) => void;
  selectedTaskId: string | null;
  updateTask: ReturnType<typeof useUpdateTask>;
}

function BoardCard({
  task,
  onToggle,
  onDelete,
  onNavigate,
  onSelect,
  isSelected,
}: {
  task: TaskWithMeeting;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onNavigate: (meetingId: string) => void;
  onSelect: (task: TaskWithMeeting) => void;
  isSelected: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status, task },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isOverdue =
    task.dueDate && !task.isCompleted && new Date(task.dueDate) < startOfToday;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(task)}
      className={`group bg-white dark:bg-neutral-800 rounded-xl border
        border-neutral-100 dark:border-neutral-700
        hover:border-neutral-200 dark:hover:border-neutral-600
        transition-[border-color,opacity] duration-150 cursor-grab active:cursor-grabbing select-none
        ${task.priority ? (PRIORITY_BORDER[task.priority] ?? '') : ''}
        ${isSelected ? 'ring-1 ring-neutral-300 dark:ring-neutral-600 border-neutral-200 dark:border-neutral-700' : ''}
        ${isDragging ? 'opacity-40' : 'opacity-100'}`}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id, !task.isCompleted);
            }}
            onPointerDown={(e) => e.stopPropagation()}
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

          <p
            className={`flex-1 text-sm leading-snug ${
              task.isCompleted
                ? 'text-neutral-400 dark:text-neutral-500 line-through'
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {task.title}
          </p>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete task"
          >
            <Trash2 className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
          </Button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap pl-6">
          {task.meeting && (
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(task.meeting!.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-auto p-0 text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 truncate max-w-[130px] font-normal"
            >
              {task.meeting.title}
            </Button>
          )}
          {task.source === 'AI_EXTRACTED' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 font-medium">
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
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
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
    </div>
  );
}

function BoardColumn({
  column,
  tasks,
  onToggle,
  onDelete,
  onNavigate,
  onSelect,
  selectedTaskId,
}: {
  column: Column;
  tasks: TaskWithMeeting[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onNavigate: (meetingId: string) => void;
  onSelect: (task: TaskWithMeeting) => void;
  selectedTaskId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-1 min-w-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
          {column.label}
        </span>
        <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-full px-1.5 py-0.5 font-medium tabular-nums">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-xl p-2 flex flex-col gap-2 transition-colors duration-150
          ${isOver ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-900/60'}`}
      >
        {tasks.length === 0 && (
          <div className="flex items-center justify-center flex-1 min-h-[120px]">
            <p className="text-[11px] text-neutral-300 dark:text-neutral-600">
              {isOver ? 'Drop here' : 'No tasks'}
            </p>
          </div>
        )}
        {tasks.map((task) => (
          <BoardCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onNavigate={onNavigate}
            onSelect={onSelect}
            isSelected={selectedTaskId === task.id}
          />
        ))}
      </div>
    </div>
  );
}

export function TaskBoardView({
  tasks,
  onToggle,
  onDelete,
  onNavigate,
  onSelect,
  selectedTaskId,
  updateTask,
}: TaskBoardViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  // Group tasks by status
  const columnTasks = useMemo(() => {
    const map: Record<TaskStatus, TaskWithMeeting[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    for (const task of tasks) {
      const status = task.status ?? 'TODO';
      if (map[status]) map[status].push(task);
    }
    return map;
  }, [tasks]);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId) ?? null,
    [tasks, activeId]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const fromStatus = active.data.current?.status as TaskStatus | undefined;
    const toStatus = over.id as TaskStatus;

    if (fromStatus !== toStatus) {
      updateTask.mutate({
        taskId: active.id as string,
        data: { status: toStatus },
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 pb-24">
        {COLUMNS.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={columnTasks[column.id]}
            onToggle={onToggle}
            onDelete={onDelete}
            onNavigate={onNavigate}
            onSelect={onSelect}
            selectedTaskId={selectedTaskId}
          />
        ))}
      </div>

      {/* Drag overlay — floating card while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div
            className={`bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600
              shadow-xl shadow-black/10 dark:shadow-black/40 cursor-grabbing select-none
              ${activeTask.priority ? (PRIORITY_BORDER[activeTask.priority] ?? '') : ''}`}
          >
            <div className="p-3">
              <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                {activeTask.title}
              </p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
