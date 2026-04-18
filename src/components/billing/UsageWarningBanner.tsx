import { X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`relative flex items-center gap-3 px-4 py-2.5 text-sm border-b ${
          isExhausted
            ? 'bg-neutral-950 border-neutral-800'
            : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700'
        }`}
      >
        <AlertTriangle
          className={`w-4 h-4 shrink-0 ${
            isExhausted ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'
          }`}
        />
        <p
          className={`flex-1 text-xs font-medium ${
            isExhausted
              ? 'text-white'
              : 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          {isExhausted
            ? `Your ${critical.label} quota is exhausted.`
            : `You've used ${Math.floor(critical.pct)}% of your ${critical.label} quota.`}{' '}
          <Button
            variant="link"
            size="xs"
            className={`inline h-auto p-0 font-semibold underline underline-offset-2 ${
              isExhausted ? 'text-white hover:text-white/80' : ''
            }`}
            onClick={() => openUpgradeModal(critical.code)}
          >
            Upgrade to Pro
          </Button>{' '}
          or{' '}
          <Button
            variant="link"
            size="xs"
            className={`inline h-auto p-0 underline underline-offset-2 ${
              isExhausted ? 'text-white/80 hover:text-white' : ''
            }`}
            onClick={() => navigate('/pricing')}
          >
            see plans
          </Button>
          .
        </p>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className={
            isExhausted
              ? 'text-white/60 hover:text-white hover:bg-white/10'
              : ''
          }
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
