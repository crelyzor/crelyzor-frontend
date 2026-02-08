import { useLocation } from 'react-router-dom';
import type { ToolbarItem } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ToolbarButtonProps = {
  item: ToolbarItem;
  onClick: (item: ToolbarItem) => void;
};

export function ToolbarButton({ item, onClick }: ToolbarButtonProps) {
  const location = useLocation();
  const isActive =
    item.action === 'navigate' && location.pathname === item.path;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onClick(item)}
          className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            isActive
              ? 'text-neutral-900 bg-neutral-100 dark:text-neutral-100 dark:bg-neutral-800'
              : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          <item.icon className="w-[18px] h-[18px]" />
          {isActive && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-neutral-900 dark:bg-neutral-100 rounded-full" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
