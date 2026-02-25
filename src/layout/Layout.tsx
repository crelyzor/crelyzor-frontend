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
    <div className="min-h-screen bg-neutral-50/40 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between gap-6">
          {/* Left - User Menu */}
          <UserMenu />

          {/* Center - Search Bar */}
          <button
            onClick={openCommandPalette}
            className="flex items-center gap-3 px-3.5 py-2 text-sm text-neutral-400 dark:text-neutral-500
                       bg-neutral-100/70 dark:bg-neutral-800/60
                       hover:bg-neutral-100 dark:hover:bg-neutral-800
                       border border-neutral-200/60 dark:border-neutral-700/50
                       hover:border-neutral-300/80 dark:hover:border-neutral-600/80
                       rounded-xl transition-all duration-200 w-80 cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
            <span className="flex-1 text-left text-[13px]">
              Search anything...
            </span>
            <div className="flex items-center gap-0.5 text-[10px] text-neutral-400 dark:text-neutral-600 bg-white/80 dark:bg-neutral-700/60 px-1.5 py-0.5 rounded-md border border-neutral-200/80 dark:border-neutral-600/50">
              <Command className="w-2.5 h-2.5" />
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
