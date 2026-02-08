import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() =>
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
          }
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-[18px] h-[18px]" />
          ) : (
            <Moon className="w-[18px] h-[18px]" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
      </TooltipContent>
    </Tooltip>
  );
}
