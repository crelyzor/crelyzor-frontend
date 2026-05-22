import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationPanel } from './NotificationPanel';
import { useUnreadCount } from '@/hooks/queries/useNotificationQueries';

function BadgeCount({ count }: { count: number }) {
  const label = count >= 100 ? '99+' : String(count);
  return (
    <motion.span
      key="badge"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      className="absolute -top-1 -right-1 flex items-center justify-center
                 min-w-[16px] h-4 px-0.5 rounded-full
                 bg-red-500 text-white text-[9px] font-semibold leading-none
                 pointer-events-none"
    >
      {label}
    </motion.span>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-9 h-9 rounded-lg
                   text-neutral-500 dark:text-neutral-400
                   hover:bg-neutral-100 dark:hover:bg-neutral-800
                   transition-colors"
      >
        <Bell className="w-4 h-4" />
        <AnimatePresence>
          {unreadCount > 0 && <BadgeCount count={unreadCount} />}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute right-0 top-11 z-50 origin-top-right"
          >
            <NotificationPanel onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
