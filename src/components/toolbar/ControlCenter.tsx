import { Pin, PinOff } from 'lucide-react';
import {
  TOOLBAR_ITEMS,
  TOOLBAR_GROUP_LABELS,
  TOOLBAR_GROUP_ORDER,
} from '@/constants';
import type { ToolbarItem } from '@/types';
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
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-[11px] tracking-widest text-neutral-500 font-medium uppercase">
          Control Center
        </h3>
        <p className="text-[11px] text-neutral-600 mt-0.5">
          Pin items to your toolbar
        </p>
      </div>

      <div className="h-px bg-white/5 mx-3" />

      <div className="max-h-80 overflow-y-auto py-1">
        {TOOLBAR_GROUP_ORDER.map((group) => (
          <div key={group}>
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] tracking-widest text-neutral-600 font-medium uppercase">
                {TOOLBAR_GROUP_LABELS[group]}
              </span>
            </div>
            {groupedItems[group]?.map((item) => {
              const pinned = isPinned(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 mx-1 rounded-[14px] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <button
                    onClick={() => onItemClick(item)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-neutral-200">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-neutral-600 truncate">
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
                        className={`w-7 h-7 flex items-center justify-center rounded-full shrink-0 transition-all cursor-pointer ${
                          pinned
                            ? 'text-white bg-[#3A3A3C] hover:bg-[#48484A]'
                            : 'text-neutral-600 hover:text-neutral-400 hover:bg-white/5'
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

      <div className="h-px bg-white/5 mx-3" />

      <div className="p-2">
        <button
          onClick={resetToDefaults}
          className="w-full text-[12px] text-neutral-600 hover:text-neutral-400 py-2 transition-colors cursor-pointer rounded-[14px] hover:bg-white/5"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
