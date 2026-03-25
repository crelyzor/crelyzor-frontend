import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grip } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useToolbarPins } from '@/hooks';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import type { ToolbarItem } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ToolbarButton } from './ToolbarButton';
import { ThemeToggle } from './ThemeToggle';
import { ControlCenter } from './ControlCenter';

const CARDS_PUBLIC_URL = import.meta.env.VITE_CARDS_PUBLIC_URL ?? 'http://localhost:5174';

export function Toolbar() {
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const navigate = useNavigate();
  const { pinnedItems, togglePin, resetToDefaults, isPinned } =
    useToolbarPins();
  const { data: currentUser } = useCurrentUser();

  const handleItemClick = useCallback(
    (item: ToolbarItem) => {
      if (item.action === 'navigate' && item.path) {
        navigate(item.path);
      } else if (item.id === 'share-link') {
        const username = currentUser?.username;
        if (!username) {
          toast.error('Set a username first to share your link');
          return;
        }
        navigator.clipboard.writeText(`${CARDS_PUBLIC_URL}/${username}`);
        toast.success('Profile link copied to clipboard');
      }
    },
    [navigate, currentUser]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <>
        {/* Backdrop for click-outside */}
        <AnimatePresence>
          {controlCenterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setControlCenterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
            />
          )}
        </AnimatePresence>

        <div className="flex items-center gap-0.5">
          {/* Pinned toolbar items — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-0.5">
            {pinnedItems.map((item) => (
              <ToolbarButton
                key={item.id}
                item={item}
                onClick={handleItemClick}
              />
            ))}
            <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1" />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Separator + Control Center trigger */}
          <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1" />

          <div className="relative">
            <AnimatePresence>
              {controlCenterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="absolute top-full right-0 mt-2 z-50 w-[280px]"
                >
                  <div className="bg-[#1C1C1E] border border-white/5 rounded-[24px] shadow-2xl overflow-hidden">
                    <ControlCenter
                      isPinned={isPinned}
                      togglePin={togglePin}
                      resetToDefaults={resetToDefaults}
                      onItemClick={(item) => {
                        setControlCenterOpen(false);
                        handleItemClick(item);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setControlCenterOpen((v) => !v)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer z-50 relative ${
                    controlCenterOpen
                      ? 'text-neutral-900 bg-neutral-100 dark:text-neutral-100 dark:bg-neutral-800'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Grip className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Control Center
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}
