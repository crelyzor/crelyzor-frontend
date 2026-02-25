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
} from '@/components/ui/command';
import {
  CalendarDays,
  Settings,
  LogOut,
  Bell,
  Home,
  CreditCard,
  Mic,
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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/meetings'))}>
            <Mic className="mr-3 h-4 w-4" />
            <span>Start Recording</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/cards/create'))}
          >
            <CreditCard className="mr-3 h-4 w-4" />
            <span>Create Card</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Home className="mr-3 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/meetings'))}>
            <CalendarDays className="mr-3 h-4 w-4" />
            <span>Meetings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/cards'))}>
            <CreditCard className="mr-3 h-4 w-4" />
            <span>Cards</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/notifications'))}
          >
            <Bell className="mr-3 h-4 w-4" />
            <span>Notifications</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-3 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/signin'))}>
            <LogOut className="mr-3 h-4 w-4 text-red-500" />
            <span className="text-red-500">Log Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
