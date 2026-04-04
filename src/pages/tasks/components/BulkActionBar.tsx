import { AnimatePresence, motion } from 'motion/react';
import { Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface BulkActionBarProps {
  count: number;
  onComplete: () => void;
  onDelete: () => void;
  onPriority: (priority: Priority) => void;
  onExit: () => void;
  isPending: boolean;
}

export function BulkActionBar({
  count,
  onComplete,
  onDelete,
  onPriority,
  onExit,
  isPending,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-1 px-2 py-1.5 bg-neutral-900 dark:bg-neutral-100 rounded-2xl shadow-2xl shadow-black/30 dark:shadow-black/10">
            {/* Count */}
            <span className="px-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 shrink-0">
              {count} selected
            </span>

            <div className="w-px h-4 bg-neutral-700 dark:bg-neutral-300 mx-0.5" />

            {/* Mark complete */}
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={onComplete}
              className="h-7 px-2.5 gap-1.5 text-[11px] text-neutral-300 dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
              <Check className="w-3 h-3" />
              Complete
            </Button>

            <div className="w-px h-4 bg-neutral-700 dark:bg-neutral-300 mx-0.5" />

            {/* Priority buttons */}
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 px-1 shrink-0">
              Priority
            </span>
            {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => onPriority(p)}
                className="h-7 px-2 text-[11px] font-medium text-neutral-300 dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
              >
                {p[0] + p.slice(1).toLowerCase()}
              </Button>
            ))}

            <div className="w-px h-4 bg-neutral-700 dark:bg-neutral-300 mx-0.5" />

            {/* Delete */}
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={onDelete}
              className="h-7 px-2.5 gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-red-400 dark:hover:text-red-500 hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>

            <div className="w-px h-4 bg-neutral-700 dark:bg-neutral-300 mx-0.5" />

            {/* Exit */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onExit}
              className="h-7 w-7 text-neutral-400 dark:text-neutral-500 hover:text-white dark:hover:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
              aria-label="Exit selection"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
