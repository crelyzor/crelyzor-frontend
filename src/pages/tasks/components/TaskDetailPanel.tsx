import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CalendarDays,
  Flag,
  ChevronDown,
  Minus,
  Check,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  useUpdateTask,
  useDeleteTask,
  useSubtasks,
  useCreateSubtask,
} from '@/hooks/queries/useSMAQueries';
import {
  useTaskTags,
  useDetachTagFromTask,
  useAttachTagToTask,
  useUserTags,
} from '@/hooks/queries/useTagQueries';
import type { TaskWithMeeting } from '@/services/smaService';
import type { TaskStatus } from '@/types/meeting';

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> =
  {
    TODO: {
      label: 'To Do',
      className:
        'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      className:
        'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900',
    },
    DONE: {
      label: 'Done',
      className:
        'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400',
    },
  };

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: 'border-l-red-400',
  MEDIUM: 'border-l-amber-400',
  LOW: 'border-l-neutral-300 dark:border-l-neutral-600',
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-red-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-neutral-300 dark:bg-neutral-600',
};

interface Props {
  task: TaskWithMeeting | null;
  onClose: () => void;
}

export function TaskDetailPanel({ task, onClose }: Props) {
  const navigate = useNavigate();
  const updateTask = useUpdateTask(task?.meetingId ?? undefined);
  const deleteTaskMut = useDeleteTask(task?.meetingId ?? undefined);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const { data: subtasks } = useSubtasks(task?.id ?? '', !!task);
  const createSubtask = useCreateSubtask(task?.id ?? '');
  const { data: taskTagsData } = useTaskTags(task?.id ?? '');
  const { data: userTags } = useUserTags();
  const attachTag = useAttachTagToTask(task?.id ?? '');
  const detachTag = useDetachTagFromTask(task?.id ?? '');

  // Sync local state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
    }
  }, [task]);

  const handleTitleBlur = useCallback(() => {
    if (!task) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(task.title);
      return;
    }
    if (trimmed !== task.title) {
      updateTask.mutate({ taskId: task.id, data: { title: trimmed } });
    }
  }, [task, title, updateTask]);

  const handleDescriptionBlur = useCallback(() => {
    if (!task) return;
    const trimmed = description.trim() || null;
    if (trimmed !== (task.description ?? null)) {
      updateTask.mutate({ taskId: task.id, data: { description: trimmed } });
    }
  }, [task, description, updateTask]);

  const handleStatusChange = useCallback(
    (status: TaskStatus) => {
      if (!task) return;
      setShowStatusMenu(false);
      updateTask.mutate({ taskId: task.id, data: { status } });
    },
    [task, updateTask]
  );

  const handlePriorityChange = useCallback(
    (priority: 'LOW' | 'MEDIUM' | 'HIGH' | null) => {
      if (!task) return;
      setShowPriorityMenu(false);
      updateTask.mutate({ taskId: task.id, data: { priority } });
    },
    [task, updateTask]
  );

  const handleDueDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!task) return;
      const val = e.target.value;
      updateTask.mutate({
        taskId: task.id,
        data: { dueDate: val ? new Date(val).toISOString() : null },
      });
    },
    [task, updateTask]
  );

  const handleDelete = useCallback(() => {
    if (!task) return;
    deleteTaskMut.mutate(task.id, {
      onSuccess: () => {
        toast.success('Task deleted');
        onClose();
      },
    });
  }, [task, deleteTaskMut, onClose]);

  const handleAddSubtask = useCallback(() => {
    const t = newSubtaskTitle.trim();
    if (!t || !task) return;
    createSubtask.mutate(
      { title: t },
      {
        onSuccess: () => {
          setNewSubtaskTitle('');
          setShowAddSubtask(false);
        },
      }
    );
  }, [task, newSubtaskTitle, createSubtask]);

  const currentStatus: TaskStatus = (task?.status as TaskStatus) ?? 'TODO';
  const isOverdue =
    task?.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date();

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/10 dark:bg-black/30"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className={`fixed right-0 top-0 bottom-0 z-40 w-[400px] bg-white dark:bg-neutral-900
                        border-l border-neutral-200 dark:border-neutral-800
                        flex flex-col shadow-2xl overflow-hidden
                        ${task.priority ? `border-l-[3px] ${PRIORITY_BORDER[task.priority]}` : ''}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                {/* Status pill */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu((v) => !v)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-opacity hover:opacity-80 ${STATUS_CONFIG[currentStatus].className}`}
                  >
                    {STATUS_CONFIG[currentStatus].label}
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                  <AnimatePresence>
                    {showStatusMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -4 }}
                        transition={{
                          type: 'spring',
                          damping: 25,
                          stiffness: 350,
                        }}
                        className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg py-1 min-w-[130px]"
                      >
                        {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(
                          (s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(s)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                                currentStatus === s
                                  ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                                  : 'text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              {currentStatus === s && (
                                <Check className="w-3 h-3 shrink-0" />
                              )}
                              {currentStatus !== s && (
                                <span className="w-3 shrink-0" />
                              )}
                              {STATUS_CONFIG[s].label}
                            </button>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={onClose}
                  aria-label="Close panel"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Title */}
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    titleRef.current?.blur();
                  }
                }}
                rows={1}
                className="w-full resize-none bg-transparent text-base font-medium text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 leading-snug"
                placeholder="Task title"
                style={{ fieldSizing: 'content' } as React.CSSProperties}
              />

              {/* Description */}
              <textarea
                ref={descRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-neutral-600 dark:text-neutral-400 outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 leading-relaxed"
                placeholder="Add a description…"
                style={{ fieldSizing: 'content' } as React.CSSProperties}
              />

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Due date */}
                <label
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors
                    ${
                      isOverdue
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  <CalendarDays className="w-3 h-3 shrink-0" />
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Due date'}
                  <input
                    type="date"
                    className="sr-only"
                    value={
                      task.dueDate
                        ? new Date(task.dueDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={handleDueDateChange}
                  />
                </label>

                {/* Priority */}
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityMenu((v) => !v)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Flag className="w-3 h-3 shrink-0" />
                    {task.priority ? (
                      <>
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`}
                        />
                        {task.priority.charAt(0) +
                          task.priority.slice(1).toLowerCase()}
                      </>
                    ) : (
                      'Priority'
                    )}
                  </button>
                  <AnimatePresence>
                    {showPriorityMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -4 }}
                        transition={{
                          type: 'spring',
                          damping: 25,
                          stiffness: 350,
                        }}
                        className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg py-1 min-w-[120px]"
                      >
                        {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => handlePriorityChange(p)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[p]}`}
                            />
                            {p.charAt(0) + p.slice(1).toLowerCase()}
                            {task.priority === p && (
                              <Check className="w-3 h-3 ml-auto" />
                            )}
                          </button>
                        ))}
                        {task.priority && (
                          <>
                            <div className="h-px bg-neutral-100 dark:bg-neutral-700 my-1" />
                            <button
                              onClick={() => handlePriorityChange(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-neutral-400 dark:text-neutral-500"
                            >
                              <Minus className="w-3 h-3 shrink-0" />
                              Clear
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-medium mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(taskTagsData ?? task.tags ?? []).map((tag) => (
                    <span
                      key={tag.id}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                      <button
                        onClick={() => detachTag.mutate(tag.id)}
                        className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${tag.name}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}

                  {/* Add tag */}
                  <div className="relative">
                    <button
                      onClick={() => setShowTagMenu((v) => !v)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      Add tag
                    </button>
                    <AnimatePresence>
                      {showTagMenu && userTags && userTags.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.94, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.94, y: -4 }}
                          transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 350,
                          }}
                          className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg py-1 min-w-[160px] max-h-48 overflow-y-auto"
                        >
                          {userTags.map((tag) => {
                            const attached = (
                              taskTagsData ??
                              task.tags ??
                              []
                            ).some((t) => t.id === tag.id);
                            return (
                              <button
                                key={tag.id}
                                onClick={() => {
                                  if (attached) {
                                    detachTag.mutate(tag.id);
                                  } else {
                                    attachTag.mutate(tag.id);
                                  }
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                              >
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                                {attached && (
                                  <Check className="w-3 h-3 ml-auto text-neutral-400" />
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Meeting source */}
              {task.meeting && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-medium mb-2">
                    From meeting
                  </p>
                  <button
                    onClick={() => navigate(`/meetings/${task.meeting!.id}`)}
                    className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {task.meeting.title}
                  </button>
                </div>
              )}

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-medium">
                    Subtasks
                    {subtasks && subtasks.length > 0 && (
                      <span className="ml-1.5 text-neutral-300 dark:text-neutral-600">
                        {subtasks.filter((s) => s.isCompleted).length}/
                        {subtasks.length}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => setShowAddSubtask(true)}
                    className="text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 flex items-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>

                <div className="space-y-1">
                  {subtasks?.map((subtask) => (
                    <SubtaskRow
                      key={subtask.id}
                      subtask={subtask}
                      onToggle={(id, completed) =>
                        updateTask.mutate({
                          taskId: id,
                          data: { isCompleted: completed },
                        })
                      }
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {showAddSubtask && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-1"
                    >
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddSubtask();
                            if (e.key === 'Escape') {
                              setShowAddSubtask(false);
                              setNewSubtaskTitle('');
                            }
                          }}
                          placeholder="Subtask title"
                          className="flex-1 bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none"
                          autoFocus
                        />
                        <Button
                          size="xs"
                          onClick={handleAddSubtask}
                          disabled={
                            !newSubtaskTitle.trim() || createSubtask.isPending
                          }
                        >
                          Add
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setShowAddSubtask(false);
                            setNewSubtaskTitle('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SubtaskRow({
  subtask,
  onToggle,
}: {
  subtask: { id: string; title: string; isCompleted: boolean };
  onToggle: (id: string, completed: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <button
        onClick={() => onToggle(subtask.id, !subtask.isCompleted)}
        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
          subtask.isCompleted
            ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400'
        }`}
        aria-label={subtask.isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {subtask.isCompleted && (
          <Check className="w-2 h-2 text-white dark:text-neutral-900" />
        )}
      </button>
      <span
        className={`text-xs flex-1 leading-snug ${
          subtask.isCompleted
            ? 'text-neutral-400 dark:text-neutral-500 line-through'
            : 'text-neutral-700 dark:text-neutral-300'
        }`}
      >
        {subtask.title}
      </span>
    </div>
  );
}
