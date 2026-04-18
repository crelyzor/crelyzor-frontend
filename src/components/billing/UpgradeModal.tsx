import { Zap, Mail, X, Mic, Bot, Sparkles, HardDrive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUIStore, type BillingLimitCode } from '@/stores/uiStore';
import { toast } from 'sonner';

// ── Copy per limit code ──────────────────────────────────────────────────────

const LIMIT_COPY: Record<
  BillingLimitCode,
  { icon: React.ElementType; title: string; description: string }
> = {
  TRANSCRIPTION_LIMIT_REACHED: {
    icon: Mic,
    title: 'Transcription limit reached',
    description:
      "You've used all your transcription minutes for this billing period. Upgrade to Pro for 5× more minutes.",
  },
  RECALL_LIMIT_REACHED: {
    icon: Bot,
    title: 'Auto-record not available',
    description:
      'Auto-recording with Recall.ai is a Pro feature. Upgrade to record your online meetings automatically.',
  },
  AI_CREDITS_EXHAUSTED: {
    icon: Sparkles,
    title: 'AI credits exhausted',
    description:
      "You've used all your AI credits this month. Upgrade to Pro for 20× more credits for Ask AI, summaries, and content generation.",
  },
  STORAGE_LIMIT_REACHED: {
    icon: HardDrive,
    title: 'Storage limit reached',
    description:
      "You've hit your 2 GB storage cap. Upgrade to Pro for 10× more storage.",
  },
};

const DEFAULT_COPY = {
  icon: Zap,
  title: 'Upgrade to Pro',
  description:
    "You've hit a limit on your Free plan. Upgrade to Pro to unlock more transcription, AI credits, and auto-recording.",
};

// ── Plan comparison ──────────────────────────────────────────────────────────

const PLAN_FEATURES = [
  { label: 'Transcription', free: '120 min / mo', pro: '600 min / mo' },
  { label: 'AI Credits', free: '50 / mo', pro: '1,000 / mo' },
  { label: 'Auto-record (Recall.ai)', free: '—', pro: '5 hrs / mo' },
  { label: 'Storage', free: '2 GB', pro: '20 GB' },
];

// ── UpgradeModal ─────────────────────────────────────────────────────────────

export function UpgradeModal() {
  const { upgradeModalOpen, upgradeModalCode, closeUpgradeModal } =
    useUIStore();

  const copy = upgradeModalCode
    ? (LIMIT_COPY[upgradeModalCode] ?? DEFAULT_COPY)
    : DEFAULT_COPY;
  const Icon = copy.icon;

  const handleContactSupport = () => {
    navigator.clipboard.writeText('support@crelyzor.com');
    toast.success('Email copied — support@crelyzor.com');
    closeUpgradeModal();
  };

  return (
    <Dialog open={upgradeModalOpen} onOpenChange={closeUpgradeModal}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-neutral-200 dark:border-neutral-800">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-6 pt-6 pb-8 text-white relative">
          <button
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">
              {copy.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-sm mt-2 leading-relaxed">
            {copy.description}
          </p>
        </div>

        {/* Plan comparison */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            What you get with Pro
          </p>
          <div className="space-y-2">
            {PLAN_FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-neutral-600 dark:text-neutral-400">
                  {f.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400 line-through text-xs">
                    {f.free}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {f.pro}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-2.5">
          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium h-10 rounded-xl shadow-sm"
            onClick={handleContactSupport}
          >
            <Mail className="w-4 h-4 mr-2" />
            Upgrade to Pro — contact us
          </Button>
          <p className="text-center text-xs text-neutral-400">
            Email copied to clipboard. We'll upgrade you within 24 hours.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
