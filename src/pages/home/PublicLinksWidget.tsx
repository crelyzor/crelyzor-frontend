import { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  CalendarDays,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';

const CARDS_PUBLIC_URL =
  import.meta.env.VITE_CARDS_PUBLIC_URL ?? 'http://localhost:5174';

function LinkRow({
  label,
  url,
  icon: Icon,
}: {
  label: string;
  url: string;
  icon: React.ElementType;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast.success(`${label} link copied`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayPath = url.replace(/^https?:\/\/[^/]+/, '');

  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-150">
      <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono truncate">
          {displayPath}
        </p>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          aria-label={`Open ${label}`}
        >
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="w-3 h-3 text-neutral-600 dark:text-neutral-300" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  );
}

export function PublicLinksWidget() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 animate-pulse">
        <div className="h-2.5 w-14 bg-neutral-100 dark:bg-neutral-800 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user?.username) {
    return (
      <button
        onClick={() => navigate('/settings?tab=profile')}
        className="w-full rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 flex items-center gap-3 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors text-left group"
      >
        <div className="w-7 h-7 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
          <Link2 className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
            Set a username
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            to get your public links
          </p>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" />
      </button>
    );
  }

  const cardUrl = `${CARDS_PUBLIC_URL}/${user.username}`;
  const scheduleUrl = `${CARDS_PUBLIC_URL}/schedule/${user.username}`;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
          Your Links
        </span>
      </div>
      <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
        <LinkRow label="Card" url={cardUrl} icon={CreditCard} />
        <LinkRow label="Schedule" url={scheduleUrl} icon={CalendarDays} />
      </div>
    </div>
  );
}
