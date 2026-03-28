import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, CheckSquare, CreditCard, Settings } from 'lucide-react';
import { motion } from 'motion/react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays, path: '/meetings' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 'cards', label: 'Cards', icon: CreditCard, path: '/cards' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
] as const;

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-200/60 dark:border-neutral-800/60 pb-safe">
      <div className="flex items-stretch h-14">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
              aria-label={item.label}
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-neutral-900 dark:bg-neutral-100"
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              />
              <span
                className={`text-[9px] font-medium transition-colors ${
                  active
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
