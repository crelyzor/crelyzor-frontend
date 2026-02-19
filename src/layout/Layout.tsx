import { Search, Command } from 'lucide-react';
import { ReactNode } from 'react';
import { useCommandPalette } from '@/hooks';
import { Toolbar } from '@/components/toolbar';
import { UserMenu } from '@/components/user-menu/UserMenu';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { openCommandPalette } = useCommandPalette();

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
          {/* Left - User Menu */}
          <UserMenu />

          {/* Center - Search Bar */}
          <button
            onClick={openCommandPalette}
            className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-400 bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 rounded-xl transition-all w-96 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">
              Search meetings, people, actions...
            </span>
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 bg-white/80 dark:bg-neutral-700/80 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-600">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>

          {/* Right - Toolbar */}
          <div className="flex items-center shrink-0">
            <Toolbar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-10">{children}</main>
    </div>
  );
}
