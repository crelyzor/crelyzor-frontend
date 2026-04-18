import { X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useBillingUsage } from '@/hooks/queries/useBillingQueries';
import { useUIStore } from '@/stores/uiStore';

/**
 * Shown when any resource hits ≥ 80% usage.
 * Dismissible for the session (does not persist to localStorage on purpose —
 * it should reappear on next app load to keep users informed).
 */
export function UsageWarningBanner() {
  const { data } = useBillingUsage();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const { openUpgradeModal } = useUIStore();

  if (dismissed || !data || data.plan !== 'FREE') return null;

  const { usage, limits } = data;

  // Find the most critical resource (highest % used)
  const resources = [
    {
      label: 'transcription',
      used: usage.transcriptionMinutes,
      limit: limits.transcriptionMinutes,
      code: 'TRANSCRIPTION_LIMIT_REACHED' as const,
    },
    {
      label: 'AI credits',
      used: usage.aiCredits,
      limit: limits.aiCredits,
      code: 'AI_CREDITS_EXHAUSTED' as const,
    },
    {
      label: 'storage',
      used: usage.storageGb,
      limit: limits.storageGb,
      code: 'STORAGE_LIMIT_REACHED' as const,
    },
  ].filter((r) => r.limit !== -1);

  const critical = resources
    .map((r) => ({ ...r, pct: (r.used / r.limit) * 100 }))
    .filter((r) => r.pct >= 80)
    .sort((a, b) => b.pct - a.pct)[0];

  if (!critical) return null;

  const isExhausted = critical.pct >= 100;

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-2.5 text-sm ${
        isExhausted
          ? 'bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/50'
          : 'bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40'
      }`}
    >
      <AlertTriangle
        className={`w-4 h-4 shrink-0 ${
          isExhausted ? 'text-red-500' : 'text-amber-500'
        }`}
      />
      <p
        className={`flex-1 text-xs font-medium ${
          isExhausted
            ? 'text-red-700 dark:text-red-400'
            : 'text-amber-700 dark:text-amber-400'
        }`}
      >
        {isExhausted
          ? `Your ${critical.label} quota is exhausted.`
          : `You've used ${Math.floor(critical.pct)}% of your ${critical.label} quota.`}{' '}
        <button
          onClick={() => openUpgradeModal(critical.code)}
          className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
        >
          Upgrade to Pro
        </button>{' '}
        or{' '}
        <button
          onClick={() => navigate('/pricing')}
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          see plans
        </button>
        .
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5 text-neutral-400" />
      </button>
    </div>
  );
}
