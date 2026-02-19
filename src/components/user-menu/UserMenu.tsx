import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCurrentUser, useLogout } from '@/hooks/queries/useAuthQueries';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const showAvatar = !!user?.avatarUrl && !imgError;

  const handleLogout = () => {
    setOpen(false);
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate('/signin', { replace: true }),
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
          {/* Avatar */}
          {showAvatar ? (
            <img
              src={user!.avatarUrl!}
              alt={user!.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
              {initials}
            </div>
          )}
          {/* Name */}
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 max-w-[120px] truncate">
            {user?.name ?? '…'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-56 p-1.5 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-xl rounded-xl"
        align="start"
        sideOffset={8}
      >
        {/* User info header */}
        <div className="px-2.5 py-2 mb-1 border-b border-neutral-100 dark:border-neutral-800">
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {user?.name}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
            {user?.email}
          </p>
        </div>

        {/* Menu items */}
        <button
          onClick={() => {
            setOpen(false);
            navigate('/settings');
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings className="w-4 h-4 text-neutral-400" />
          Settings
        </button>

        <button
          onClick={() => {
            setOpen(false);
            navigate('/settings');
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <User className="w-4 h-4 text-neutral-400" />
          Profile
        </button>

        <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </PopoverContent>
    </Popover>
  );
}
