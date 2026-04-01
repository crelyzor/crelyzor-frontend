import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CalendarPlus, CheckSquare, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateStandaloneTask } from '@/hooks/queries/useSMAQueries';
import { toast } from 'sonner';

interface QuickCreatePopoverProps {
  time: Date;
  x: number;
  y: number;
  onClose: () => void;
}

const POPOVER_W = 220;

export function QuickCreatePopover({
  time,
  x,
  y,
  onClose,
}: QuickCreatePopoverProps) {
  const navigate = useNavigate();
  const createTask = useCreateStandaloneTask();
  const [mode, setMode] = useState<'pick' | 'task'>('pick');
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Clamp to viewport so the popover never clips off screen
  const left = Math.min(x + 6, window.innerWidth - POPOVER_W - 8);
  const top = Math.min(y + 6, window.innerHeight - 180);

  const timeLabel = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [onClose]);

  // Auto-focus input when task mode opens
  useEffect(() => {
    if (mode === 'task') {
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [mode]);

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate(
      { title: title.trim(), scheduledTime: time.toISOString() },
      {
        onSuccess: () => {
          toast.success('Task created');
          onClose();
        },
      }
    );
  }

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, scale: 0.94, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -4 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      style={{ position: 'fixed', left, top, width: POPOVER_W, zIndex: 50 }}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
      // Prevent clicks inside the popover from bubbling to the calendar grid
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          {mode === 'task' && (
            <button
              onClick={() => setMode('pick')}
              className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
            {timeLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {mode === 'pick' ? (
        <div className="p-1.5 flex flex-col gap-0.5">
          <button
            onClick={() => setMode('task')}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <CheckSquare className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 shrink-0 transition-colors" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              New task
            </span>
          </button>
          <button
            onClick={() => {
              navigate(
                `/meetings/new?time=${encodeURIComponent(time.toISOString())}`
              );
              onClose();
            }}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 shrink-0 transition-colors" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              New meeting
            </span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateTask} className="p-2 flex flex-col gap-2">
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task name…"
            className="h-8 text-sm bg-transparent"
          />
          <Button
            type="submit"
            size="sm"
            className="h-7 text-xs w-full"
            disabled={!title.trim() || createTask.isPending}
          >
            {createTask.isPending ? 'Creating…' : 'Create task'}
          </Button>
        </form>
      )}
    </motion.div>
  );
}
