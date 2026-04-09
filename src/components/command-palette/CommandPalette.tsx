import { useEffect, useState } from 'react';
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
  LogOut,
  Plus,
  ArrowRight,
  CheckSquare,
  Mic,
  CalendarPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUIStore } from '@/stores';
import { TOOLBAR_ITEMS } from '@/constants/toolbar';
import { PRIORITY_LABELS, PRIORITY_STYLES } from '@/constants/task';
import { useCreateStandaloneTask } from '@/hooks/queries/useSMAQueries';
import { parseTaskInput } from '@/lib/parseTaskInput';

// Navigation items are derived from TOOLBAR_ITEMS — single source of truth
const NAV_ITEMS = TOOLBAR_ITEMS.filter((item) => item.action === 'navigate');

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const createTask = useCreateStandaloneTask();

  const handleOpenChange = (v: boolean) => {
    if (v) {
      useUIStore.getState().openCommandPalette();
    } else {
      useUIStore.getState().closeCommandPalette();
      setSearch('');
    }
  };

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
    setSearch('');
    command();
  };

  const handleCreateTask = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    const parsed = parseTaskInput(trimmed);
    createTask.mutate(parsed, {
      onSuccess: () => {
        toast.success(`Task created: ${parsed.title}`);
      },
    });
    useUIStore.getState().closeCommandPalette();
    setSearch('');
  };

  const parsed = search.trim() ? parseTaskInput(search.trim()) : null;

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      className="cmd-spring"
    >
      <CommandInput
        placeholder="Search or type a task to create…"
        value={search}
        onValueChange={setSearch}
        className="focus-visible:ring-0 focus:ring-0 focus:outline-none"
      />
      <CommandList className="max-h-[360px] py-2">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-8 text-neutral-400 dark:text-neutral-500">
            <span className="text-sm">No results found</span>
          </div>
        </CommandEmpty>

        <CommandGroup heading="Quick Actions">
          {/* Create Task — shown when there's search text; value=search so cmdk always matches it */}
          {search.trim() && (
            <CommandItem
              value={search}
              onSelect={handleCreateTask}
              className="gap-2"
            >
              <CheckSquare className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span className="flex-1 truncate">
                Create: <span className="font-medium">{parsed?.title}</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                {parsed?.priority && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_STYLES[parsed.priority] ?? ''}`}
                  >
                    {PRIORITY_LABELS[parsed.priority]}
                  </span>
                )}
                {parsed?.dueDateLabel && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    {parsed.dueDateLabel}
                  </span>
                )}
              </span>
            </CommandItem>
          )}

          <CommandItem
            onSelect={() => runCommand(() => navigate('/?create=voice-note'))}
          >
            <Mic className="text-neutral-500 dark:text-neutral-400" />
            <span>Voice Note</span>
            <CommandShortcut>
              <ArrowRight className="w-3 h-3" />
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => navigate('/?create=meeting-recording'))
            }
          >
            <CalendarPlus className="text-neutral-500 dark:text-neutral-400" />
            <span>Start Meeting Recording</span>
            <CommandShortcut>
              <ArrowRight className="w-3 h-3" />
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              runCommand(() => navigate('/meetings?create=scheduled'))
            }
          >
            <Plus className="text-neutral-500 dark:text-neutral-400" />
            <span>Schedule Meeting</span>
            <CommandShortcut>
              <ArrowRight className="w-3 h-3" />
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate('/tasks?create=1'))}
          >
            <CheckSquare className="text-neutral-500 dark:text-neutral-400" />
            <span>Create Task</span>
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
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(() => navigate(item.path!))}
            >
              <item.icon className="text-neutral-500 dark:text-neutral-400" />
              <span>{item.label}</span>
              {item.description && (
                <span className="ml-auto text-[10px] text-neutral-400 dark:text-neutral-500 hidden sm:block">
                  {item.description}
                </span>
              )}
            </CommandItem>
          ))}
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
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[9px]">
            ↑↓
          </kbd>
          navigate
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[9px]">
            ↵
          </kbd>
          select
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[9px]">
            esc
          </kbd>
          close
        </span>
        {!search.trim() && (
          <span className="ml-auto text-[10px] text-neutral-300 dark:text-neutral-600 hidden sm:block">
            type a task · use <span className="font-medium">high</span> /
            <span className="font-medium"> tomorrow</span> to set priority &amp;
            date
          </span>
        )}
      </div>
    </CommandDialog>
  );
}
