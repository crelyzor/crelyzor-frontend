import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, ChevronDown, Sparkles } from 'lucide-react';
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

  const close = () => setOpen(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <>
            {/* Menu panel */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ type: 'spring', damping: 28, stiffness: 400 }}
              className="absolute top-full left-0 mt-1.5 z-50 w-[220px]"
            >
              <div className="rounded-[20px] p-1.5 flex flex-col bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-white/[0.06] shadow-xl dark:shadow-black/50">
                {/* User info */}
                <div className="px-3 py-2.5">
                  <p className="text-[13px] font-semibold text-neutral-900 dark:text-white truncate leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <div className="h-px bg-neutral-100 dark:bg-white/[0.06] mx-1 my-0.5" />

                {/* Profile */}
                <MenuItem
                  icon={User}
                  label="Profile"
                  onClick={() => {
                    close();
                    navigate('/settings?tab=profile');
                  }}
                />

                {/* Settings */}
                <MenuItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => {
                    close();
                    navigate('/settings?tab=appearance');
                  }}
                />

                {/* Getting started — re-opens onboarding overlay */}
                <MenuItem
                  icon={Sparkles}
                  label="Getting started"
                  onClick={() => {
                    close();
                    if (user?.id) {
                      localStorage.removeItem(
                        `crelyzor_onboarding_done:${user.id}`
                      );
                      sessionStorage.setItem('crelyzor_onboarding_force', '1');
                    }
                    navigate('/');
                  }}
                />

                <div className="h-px bg-neutral-100 dark:bg-white/[0.06] mx-1 my-0.5" />

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors active:scale-[0.98] w-full text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
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
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        {showAvatar ? (
          <img
            src={user!.avatarUrl!}
            alt={user!.name}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 max-w-[110px] truncate">
          {user?.name ?? '…'}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </motion.div>
      </button>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-[13px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition-colors active:scale-[0.98] w-full text-left"
    >
      <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
      </div>
      {label}
    </button>
  );
}
