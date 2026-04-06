import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  CalendarDays,
  Trash2,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagChip } from '@/components/ui/TagChip';
import type { TaskWithMeeting } from '@/services/smaService';
import type { useReorderTasks } from '@/hooks/queries/useSMAQueries';

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

interface TaskListViewProps {
  tasks: TaskWithMeeting[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onNavigate: (meetingId: string) => void;
  onSelect: (task: TaskWithMeeting) => void;
  selectedTaskId: string | null;
  reorderTasks: ReturnType<typeof useReorderTasks>;
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onCheck?: (id: string) => void;
}

function SortableTaskRow({
  task,
  onToggle,
  onDelete,
  onNavigate,
  onSelect,
  isSelected,
  index,
  selectMode,
  isChecked,
  onCheck,
}: {
  task: TaskWithMeeting;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onNavigate: (meetingId: string) => void;
  onSelect: (task: TaskWithMeeting) => void;
  isSelected: boolean;
  index: number;
  selectMode?: boolean;
  isChecked?: boolean;
  onCheck?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isOverdue =
    task.dueDate && !task.isCompleted && new Date(task.dueDate) < startOfToday;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.22,
        delay: index * 0.02,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onClick={() => (selectMode ? onCheck?.(task.id) : onSelect(task))}
      className={`group flex items-start gap-2 px-4 py-3.5 cursor-pointer
        bg-white dark:bg-neutral-900
        border border-neutral-100 dark:border-neutral-800
        hover:border-neutral-200 dark:hover:border-neutral-700
        rounded-xl transition-[border-color,box-shadow] duration-200
        ${task.priority ? (PRIORITY_BORDER[task.priority] ?? '') : ''}
        ${isSelected && !selectMode ? 'ring-1 ring-neutral-300 dark:ring-neutral-600 border-neutral-200 dark:border-neutral-700' : ''}
        ${isChecked ? 'ring-1 ring-neutral-400 dark:ring-neutral-500 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800' : ''}
        ${isDragging ? 'shadow-lg shadow-black/10 dark:shadow-black/30' : ''}`}
    >
      {selectMode ? (
        /* Bulk selection checkbox (square) */
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onCheck?.(task.id);
          }}
          className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors p-0 ${
            isChecked
              ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400'
          }`}
          aria-label={isChecked ? 'Deselect' : 'Select'}
        >
          {isChecked && (
            <Check className="w-2.5 h-2.5 text-white dark:text-neutral-900" />
          )}
        </Button>
      ) : (
        <>
          {/* Drag handle */}
          <Button
            variant="ghost"
            size="icon-xs"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          </Button>

          {/* Complete checkbox */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id, !task.isCompleted);
            }}
            className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors p-0 ${
              task.isCompleted
                ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400'
            }`}
            aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.isCompleted && (
              <Check className="w-2.5 h-2.5 text-white dark:text-neutral-900" />
            )}
          </Button>
        </>
      )}

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
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(task.meeting!.id);
              }}
              className="h-auto p-0 text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 truncate max-w-[160px] font-normal"
            >
              {task.meeting.title}
            </Button>
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
            <TagChip key={tag.id} tag={tag} />
          ))}
        </div>
      </div>

      {!selectMode && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
        </Button>
      )}
    </motion.div>
  );
}

export function TaskListView({
  tasks,
  onToggle,
  onDelete,
  onNavigate,
  onSelect,
  selectedTaskId,
  reorderTasks,
  selectMode,
  selectedIds,
  onCheck,
}: TaskListViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
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
    if (!over || active.id === over.id) return;

    const oldIndex = taskIds.indexOf(active.id as string);
    const newIndex = taskIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(taskIds, oldIndex, newIndex);
    reorderTasks.mutate(newOrder);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5 pb-24">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, i) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                index={i}
                onToggle={onToggle}
                onDelete={onDelete}
                onNavigate={onNavigate}
                onSelect={onSelect}
                isSelected={selectedTaskId === task.id}
                selectMode={selectMode}
                isChecked={selectedIds?.has(task.id) ?? false}
                onCheck={onCheck}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>

      {/* Overlay — minimal floating label while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl shadow-black/10 dark:shadow-black/30 px-4 py-3 cursor-grabbing">
            <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
              {activeTask.title}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
