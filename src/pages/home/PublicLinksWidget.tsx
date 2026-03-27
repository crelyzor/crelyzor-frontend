import { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  CalendarDays,
  CreditCard,
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

  // Show just the path segment so it stays compact
  const displayPath = url.replace(/^https?:\/\/[^/]+/, '');

  return (
    <div className="group flex items-center gap-3 px-4 py-3">
      <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-[11px] text-neutral-700 dark:text-neutral-300 font-mono truncate">
          {displayPath}
        </p>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          aria-label={`Open ${label} link`}
        >
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          aria-label={`Copy ${label} link`}
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
        <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded mb-3" />
        <div className="space-y-3">
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
        className="w-full rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 flex items-center gap-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
          <Link2 className="w-4 h-4 text-neutral-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Set a username
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            to get your public links
          </p>
        </div>
      </button>
    );
  }

  const cardUrl = `${CARDS_PUBLIC_URL}/${user.username}`;
  const scheduleUrl = `${CARDS_PUBLIC_URL}/schedule/${user.username}`;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Your Links
        </h3>
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800 pb-1">
        <LinkRow label="Card" url={cardUrl} icon={CreditCard} />
        <LinkRow label="Schedule" url={scheduleUrl} icon={CalendarDays} />
      </div>
    </div>
  );
}
