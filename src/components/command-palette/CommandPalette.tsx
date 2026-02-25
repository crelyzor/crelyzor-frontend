import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  CalendarDays,
  Settings,
  LogOut,
  Home,
  CreditCard,
  Mic,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useUIStore } from '@/stores';

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = (v: boolean) => {
    if (v) useUIStore.getState().openCommandPalette();
    else useUIStore.getState().closeCommandPalette();
  };
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    useUIStore.getState().closeCommandPalette();
    command();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="cmd-spring w-full max-w-[520px] rounded-2xl shadow-2xl shadow-neutral-900/25 dark:shadow-neutral-950/70 ring-1 ring-neutral-200/80 dark:ring-neutral-700/60"
    >
      <CommandInput placeholder="Search anything..." />
      <CommandList className="max-h-[360px] py-2">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-8 text-neutral-400 dark:text-neutral-500">
            <span className="text-sm">No results found</span>
          </div>
        </CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/meetings/create'))}>
            <Mic className="text-neutral-500 dark:text-neutral-400" />
            <span>New Meeting</span>
            <CommandShortcut>
              <ArrowRight className="w-3 h-3" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/cards/create'))}
          >
            <Plus className="text-neutral-500 dark:text-neutral-400" />
            <span>Create Card</span>
            <CommandShortcut>
              <ArrowRight className="w-3 h-3" />
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1" />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Home className="text-neutral-500 dark:text-neutral-400" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/meetings'))}>
            <CalendarDays className="text-neutral-500 dark:text-neutral-400" />
            <span>Meetings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/cards'))}>
            <CreditCard className="text-neutral-500 dark:text-neutral-400" />
            <span>Cards</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="text-neutral-500 dark:text-neutral-400" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1" />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate('/signin'))}>
            <LogOut className="text-red-400" />
            <span className="text-red-500 dark:text-red-400">Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      {/* Footer hint */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800">
        <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[9px]">↑↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[9px]">↵</kbd>
          select
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[9px]">esc</kbd>
          close
        </span>
      </div>
    </CommandDialog>
  );
}
