import { Pin, PinOff } from 'lucide-react';
import {
  TOOLBAR_ITEMS,
  TOOLBAR_GROUP_LABELS,
  TOOLBAR_GROUP_ORDER,
} from '@/constants';
import type { ToolbarItem } from '@/types';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ControlCenterProps = {
  isPinned: (id: string) => boolean;
  togglePin: (id: string) => void;
  resetToDefaults: () => void;
  onItemClick: (item: ToolbarItem) => void;
};

export function ControlCenter({
  isPinned,
  togglePin,
  resetToDefaults,
  onItemClick,
}: ControlCenterProps) {
  const groupedItems = TOOLBAR_ITEMS.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, ToolbarItem[]>
  );

  return (
    <div>
      <div className="p-3 pb-2">
        <h3 className="text-xs tracking-widest text-neutral-400 dark:text-neutral-500 font-medium">
          CONTROL CENTER
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
          Pin items to your toolbar
        </p>
      </div>

      <Separator className="bg-neutral-100 dark:bg-neutral-800" />

      <div className="max-h-80 overflow-y-auto py-1">
        {TOOLBAR_GROUP_ORDER.map((group) => (
          <div key={group}>
            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] tracking-widest text-neutral-400 dark:text-neutral-500 font-medium">
                {TOOLBAR_GROUP_LABELS[group]}
              </span>
            </div>
            {groupedItems[group]?.map((item) => {
              const pinned = isPinned(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <button
                    onClick={() => onItemClick(item)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                        {item.description}
                      </div>
                    </div>
                  </button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(item.id);
                        }}
                        className={`w-7 h-7 flex items-center justify-center rounded-md shrink-0 transition-all cursor-pointer ${
                          pinned
                            ? 'text-neutral-900 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600'
                            : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 dark:text-neutral-600 dark:hover:text-neutral-400 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {pinned ? (
                          <PinOff className="w-3.5 h-3.5" />
                        ) : (
                          <Pin className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      {pinned ? 'Unpin from toolbar' : 'Pin to toolbar'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <Separator className="bg-neutral-100 dark:bg-neutral-800" />

      <div className="p-2">
        <button
          onClick={resetToDefaults}
          className="w-full text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 py-1.5 transition-colors cursor-pointer"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
