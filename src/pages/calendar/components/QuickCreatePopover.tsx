import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { CalendarPlus, CheckSquare, X } from 'lucide-react';

interface QuickCreatePopoverProps {
  time: Date;
  x: number;
  y: number;
  onClose: () => void;
  onNewMeeting: (time: Date) => void;
  onNewTask: (time: Date) => void;
}

const POPOVER_W = 220;

export function QuickCreatePopover({
  time,
  x,
  y,
  onClose,
  onNewMeeting,
  onNewTask,
}: QuickCreatePopoverProps) {
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
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
          {timeLabel}
        </span>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="p-1.5 flex flex-col gap-0.5">
        <button
          onClick={() => {
            onNewTask(time);
            onClose();
          }}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
        >
          <CheckSquare className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 shrink-0 transition-colors" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            New task
          </span>
        </button>
        <button
          onClick={() => {
            onNewMeeting(time);
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
    </motion.div>
  );
}
