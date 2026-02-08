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
} from '@/components/ui/command';
import {
  CalendarDays,
  Clock,
  Plus,
  Settings,
  Video,
  LogOut,
  User,
  Search,
  Link2,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => navigate('/meetings/create'))}
          >
            <Plus className="mr-3 h-4 w-4" />
            <span>Create Meeting</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {})}>
            <Link2 className="mr-3 h-4 w-4" />
            <span>Share Booking Link</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <CalendarDays className="mr-3 h-4 w-4" />
            <span>Meetings</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/availability'))}
          >
            <Clock className="mr-3 h-4 w-4" />
            <span>Availability</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/recordings'))}
          >
            <Video className="mr-3 h-4 w-4" />
            <span>Recordings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-3 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/account'))}>
            <User className="mr-3 h-4 w-4" />
            <span>View Account</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/signin'))}>
            <LogOut className="mr-3 h-4 w-4 text-red-500" />
            <span className="text-red-500">Log Out</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Searches">
          <CommandItem>
            <Search className="mr-3 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            <span className="text-neutral-500 dark:text-neutral-400">
              Product Review Meeting
            </span>
          </CommandItem>
          <CommandItem>
            <Search className="mr-3 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            <span className="text-neutral-500 dark:text-neutral-400">
              Team Sync
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
