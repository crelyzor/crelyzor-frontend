import { useState } from 'react';
import { Check, ChevronDown, UserRound } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTeamMembers } from '@/hooks/queries/useTeamQueries';

interface Props {
  teamId: string;
  value: string | null;
  onChange: (assigneeId: string | null) => void;
  compact?: boolean;
}

export function AssigneePicker({ teamId, value, onChange, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const { data } = useTeamMembers(teamId);
  const members = data?.members ?? [];

  const selected = value ? members.find((m) => m.user.id === value) : null;

  const handleSelect = (userId: string | null) => {
    onChange(userId);
    setOpen(false);
  };

  const triggerLabel = selected
    ? (selected.user.name ?? selected.user.email)
    : 'Unassigned';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {compact ? (
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
            title={triggerLabel}
          >
            {selected?.user.avatarUrl ? (
              <img
                src={selected.user.avatarUrl}
                alt={triggerLabel}
                className="w-6 h-6 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserRound className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full"
          >
            {selected?.user.avatarUrl ? (
              <img
                src={selected.user.avatarUrl}
                alt={triggerLabel}
                className="w-5 h-5 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserRound className="w-4 h-4 text-neutral-400 shrink-0" />
            )}
            <span className="flex-1 text-left text-neutral-700 dark:text-neutral-300 truncate">
              {triggerLabel}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="p-1.5 w-52">
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <UserRound className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="flex-1 text-left">Unassigned</span>
          {!value && <Check className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
        </button>

        {members.length > 0 && (
          <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
        )}

        {members.map((m) => (
          <button
            key={m.user.id}
            type="button"
            onClick={() => handleSelect(m.user.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {m.user.avatarUrl ? (
              <img
                src={m.user.avatarUrl}
                alt={m.user.name ?? m.user.email}
                className="w-5 h-5 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[9px] font-semibold text-neutral-600 dark:text-neutral-300 shrink-0">
                {(m.user.name ?? m.user.email)[0].toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-left truncate">
              {m.user.name ?? m.user.email}
            </span>
            {value === m.user.id && (
              <Check className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
