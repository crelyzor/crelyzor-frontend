import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrentUser, useLogout } from '@/hooks/queries/useAuthQueries';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const triggerRef = useRef<HTMLButtonElement>(null);
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
    <div className="relative">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50"
            />

            {/* Menu panel — drops below trigger */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute top-full left-0 mt-2 z-50 w-[240px]"
            >
              <div className="bg-[#1C1C1E] border border-white/5 rounded-[24px] p-2 shadow-2xl flex flex-col gap-1">
                {/* User info header */}
                <div className="px-3 py-2.5 mb-0.5">
                  <p className="text-[13px] font-semibold text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <div className="h-px bg-white/5 mx-2" />

                {/* Settings */}
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/settings');
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-[16px] text-[14px] text-neutral-300 hover:bg-white/5 hover:text-white transition-all active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4 text-neutral-400" />
                  </div>
                  Settings
                </button>

                {/* Profile */}
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/settings');
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-[16px] text-[14px] text-neutral-300 hover:bg-white/5 hover:text-white transition-all active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-neutral-400" />
                  </div>
                  Profile
                </button>

                <div className="h-px bg-white/5 mx-2" />

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-3 px-3 py-3 rounded-[16px] text-[14px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                  {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
      >
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
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 max-w-[120px] truncate">
          {user?.name ?? '…'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
      </button>
    </div>
  );
}
