import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, X, CalendarDays } from 'lucide-react';
import { useCreateStandaloneTask } from '@/hooks/queries/useSMAQueries';
import { parseTaskInput } from '@/lib/parseTaskInput';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type ActivePopover = 'date' | 'priority' | null;

const PRIORITY_OPTIONS: {
  value: Priority;
  label: string;
  color: string;
  bg: string;
}[] = [
  {
    value: 'HIGH',
    label: 'High',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30 text-red-400',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  {
    value: 'LOW',
    label: 'Low',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  },
];

const DATE_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'Next week', days: 7 },
];

function toISODate(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** If provided, navigate to task detail after creation instead of just closing */
  navigateOnSuccess?: boolean;
};

export function CreateTaskModal({ open, onClose, navigateOnSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueLabel, setDueLabel] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [activePopover, setActivePopover] = useState<ActivePopover>(null);
  // Track whether the user manually set date/priority so NL doesn't overwrite
  const [manualDue, setManualDue] = useState(false);
  const [manualPriority, setManualPriority] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateStandaloneTask();
  const navigate = useNavigate();

  // Auto-focus on open, full reset on close
  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 60);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(null);
      setDueLabel(null);
      setPriority(null);
      setActivePopover(null);
      setManualDue(false);
      setManualPriority(false);
    }
  }, [open]);

  // NL parse — only fills chips if user hasn't manually set them
  useEffect(() => {
    if (!title.trim()) return;
    const parsed = parseTaskInput(title.trim());
    if (parsed.dueDate && !manualDue) {
      setDueDate(parsed.dueDate);
      setDueLabel(parsed.dueDateLabel ?? null);
    }
    if (parsed.priority && !manualPriority) {
      setPriority(parsed.priority);
    }
  }, [title, manualDue, manualPriority]);

  // Close popovers when clicking outside the modal
  useEffect(() => {
    if (!activePopover) return;
    const handler = (e: MouseEvent) => {
      if (!modalRef.current?.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activePopover]);

  const handleSetDate = useCallback((label: string, iso: string) => {
    setDueDate(iso);
    setDueLabel(label);
    setManualDue(true);
    setActivePopover(null);
  }, []);

  const handleClearDate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDueDate(null);
    setDueLabel(null);
    setManualDue(false);
  }, []);

  const handleSetPriority = useCallback((p: Priority) => {
    setPriority(p);
    setManualPriority(true);
    setActivePopover(null);
  }, []);

  const handleClearPriority = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPriority(null);
    setManualPriority(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || createTask.isPending) return;
    const parsed = parseTaskInput(title.trim());
    createTask.mutate(
      {
        title: parsed.title,
        description: description.trim() || undefined,
        dueDate: dueDate ?? parsed.dueDate,
        priority: priority ?? parsed.priority,
      },
      {
        onSuccess: (task) => {
          onClose();
          if (navigateOnSuccess) navigate(`/tasks?selected=${task.id}`);
        },
      }
    );
  }, [
    title,
    description,
    dueDate,
    priority,
    createTask,
    onClose,
    navigateOnSuccess,
    navigate,
  ]);

  // Keyboard handler — Escape closes popover first, then modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePopover) {
          setActivePopover(null);
          return;
        }
        onClose();
      }
    },
    [activePopover, onClose]
  );

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      handleKeyDown(e);
    },
    [handleSubmit, handleKeyDown]
  );

  // Description Enter does NOT submit — just newline (handled natively by textarea)
  const handleDescKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') handleKeyDown(e);
    },
    [handleKeyDown]
  );

  const priorityInfo = PRIORITY_OPTIONS.find((p) => p.value === priority);
  const canSubmit = title.trim().length > 0 && !createTask.isPending;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (activePopover) {
                setActivePopover(null);
                return;
              }
              onClose();
            }}
            className="fixed inset-0 z-50 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{
              type: 'spring',
              damping: 32,
              stiffness: 420,
              mass: 0.7,
            }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 z-50 w-full max-w-[500px] px-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/[0.07] shadow-2xl shadow-black/20 dark:shadow-black/60 overflow-visible">
              {/* Title */}
              <div className="px-4 pt-4 pb-1">
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  placeholder="Task name"
                  className="w-full bg-transparent text-[16px] font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus-visible:outline-none"
                />
              </div>

              {/* Description */}
              <div className="px-4 pb-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleDescKeyDown}
                  placeholder="Description"
                  rows={1}
                  className="w-full bg-transparent text-[13px] text-neutral-500 dark:text-neutral-400 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus-visible:outline-none resize-none leading-relaxed"
                  style={{ minHeight: '20px' }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                />
              </div>

              {/* Chips */}
              <div className="px-3 pb-3 flex items-center gap-2">
                {/* Due date chip */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setActivePopover(activePopover === 'date' ? null : 'date')
                    }
                    className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-[12px] font-medium transition-all ${
                      dueDate
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'border-neutral-200 dark:border-white/10 text-neutral-400 dark:text-neutral-500 hover:border-neutral-300 dark:hover:border-white/20 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    <span>{dueLabel ?? 'Due date'}</span>
                    {dueDate && (
                      <span
                        onClick={handleClearDate}
                        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {activePopover === 'date' && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 mt-1.5 z-10 rounded-xl py-1 min-w-[140px]"
                        style={{
                          background: '#232325',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        }}
                      >
                        {DATE_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() =>
                              handleSetDate(
                                preset.label,
                                toISODate(preset.days)
                              )
                            }
                            className="w-full text-left px-3 py-2 text-[12px] text-neutral-200 hover:bg-white/5 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                        <div className="h-px bg-white/5 mx-2 my-1" />
                        <button
                          className="w-full text-left px-3 py-2 text-[12px] text-neutral-400 hover:bg-white/5 transition-colors cursor-pointer"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => dateInputRef.current?.showPicker()}
                        >
                          Pick a date…
                          <input
                            ref={dateInputRef}
                            type="date"
                            className="sr-only"
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const d = new Date(e.target.value + 'T00:00:00');
                              handleSetDate(
                                d.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                }),
                                e.target.value
                              );
                            }}
                          />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Priority chip */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setActivePopover(
                        activePopover === 'priority' ? null : 'priority'
                      )
                    }
                    className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-[12px] font-medium transition-all ${
                      priority
                        ? priorityInfo!.bg
                        : 'border-neutral-200 dark:border-white/10 text-neutral-400 dark:text-neutral-500 hover:border-neutral-300 dark:hover:border-white/20 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                  >
                    <Flag
                      className={`w-3.5 h-3.5 shrink-0 ${priorityInfo?.color ?? ''}`}
                    />
                    <span>{priorityInfo?.label ?? 'Priority'}</span>
                    {priority && (
                      <span
                        onClick={handleClearPriority}
                        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {activePopover === 'priority' && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 mt-1.5 z-10 rounded-xl py-1 min-w-[130px]"
                        style={{
                          background: '#232325',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        }}
                      >
                        {PRIORITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleSetPriority(opt.value)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-white/5 transition-colors ${
                              priority === opt.value
                                ? 'text-white'
                                : 'text-neutral-300'
                            }`}
                          >
                            <Flag className={`w-3.5 h-3.5 ${opt.color}`} />
                            {opt.label}
                            {priority === opt.value && (
                              <span className="ml-auto text-white/40 text-[10px]">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                        <div className="h-px bg-white/5 mx-2 my-1" />
                        <button
                          onClick={() => {
                            setPriority(null);
                            setManualPriority(false);
                            setActivePopover(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-neutral-600 hover:text-neutral-400 hover:bg-white/5 transition-colors"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          No priority
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-100 dark:bg-white/[0.06]" />

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-4 py-3">
                <button
                  onClick={onClose}
                  className="h-8 px-3.5 rounded-lg text-[13px] font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`h-8 px-3.5 rounded-lg text-[13px] font-semibold transition-all active:scale-[0.97] ${
                    canSubmit
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-white/5 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  {createTask.isPending ? 'Adding…' : 'Add task'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
