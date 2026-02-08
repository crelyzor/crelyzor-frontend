import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grip } from 'lucide-react';
import { useToolbarPins } from '@/hooks';
import type { ToolbarItem } from '@/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ToolbarButton } from './ToolbarButton';
import { ThemeToggle } from './ThemeToggle';
import { ControlCenter } from './ControlCenter';

export function Toolbar() {
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const navigate = useNavigate();
  const { pinnedItems, togglePin, resetToDefaults, isPinned } =
    useToolbarPins();

  const handleItemClick = useCallback(
    (item: ToolbarItem) => {
      if (item.action === 'navigate' && item.path) {
        navigate(item.path);
      }
    },
    [navigate]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5">
        {/* Pinned toolbar items */}
        {pinnedItems.map((item) => (
          <ToolbarButton key={item.id} item={item} onClick={handleItemClick} />
        ))}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Separator + Control Center trigger */}
        <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <Popover open={controlCenterOpen} onOpenChange={setControlCenterOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                    controlCenterOpen
                      ? 'text-neutral-900 bg-neutral-100 dark:text-neutral-100 dark:bg-neutral-800'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Grip className="w-[18px] h-[18px]" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Control Center
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            className="w-72 p-0 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-xl rounded-xl"
            align="start"
            sideOffset={8}
          >
            <ControlCenter
              isPinned={isPinned}
              togglePin={togglePin}
              resetToDefaults={resetToDefaults}
              onItemClick={handleItemClick}
            />
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
