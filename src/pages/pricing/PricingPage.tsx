import {
  Check,
  Zap,
  Mic,
  Bot,
  Sparkles,
  HardDrive,
  Mail,
  ArrowRight,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageMotion } from '@/components/PageMotion';
import { useBillingUsage } from '@/hooks/queries/useBillingQueries';
import { useUIStore } from '@/stores/uiStore';

const SUPPORT_EMAIL = 'harshkeshari100@gmail.com';
const PUBLIC_URL =
  import.meta.env.VITE_CARDS_PUBLIC_URL ?? 'https://cards.crelyzor.com';

// ── Plan comparison ──────────────────────────────────────────────────────────

const PLAN_FEATURES: Array<{
  icon: React.ElementType;
  label: string;
  free: string;
  pro: string;
}> = [
  {
    icon: Mic,
    label: 'Transcription',
    free: '120 min / mo',
    pro: '600 min / mo',
  },
  { icon: Sparkles, label: 'AI Credits', free: '50 / mo', pro: '1,000 / mo' },
  {
    icon: Bot,
    label: 'Auto-record & Transcribe (Google Meet)',
    free: '—',
    pro: '5 hrs / mo',
  },
  { icon: HardDrive, label: 'Storage', free: '2 GB', pro: '20 GB' },
];

const FREE_BULLETS = [
  '120 transcription min / month',
  '50 AI credits / month',
  'Digital Cards + QR codes',
  'Meeting notes & tasks',
  'Unlimited scheduling',
  'Global search',
];

const PRO_BULLETS = [
  '600 transcription min / month',
  '1,000 AI credits / month',
  '5 hrs auto-record & transcribe on Google Meet',
  '20 GB storage',
  'Everything in Free',
  'Priority support',
];

const FAQS = [
  {
    q: 'What counts as an AI credit?',
    a: 'One credit covers one AI operation — a summary, task extraction, content generation, or a few Ask AI exchanges. Credits are consumed based on OpenAI token usage.',
  },
  {
    q: 'Do credits roll over?',
    a: 'No. Transcription minutes, AI credits, and auto-record hours all reset on the 1st of each month.',
  },
  {
    q: 'How do I upgrade?',
    a: `Email us at ${SUPPORT_EMAIL} and we'll upgrade your account within 24 hours. Self-serve payments are coming soon.`,
  },
  {
    q: 'Can I downgrade back to Free?',
    a: "Yes — email us and we'll downgrade at the end of your billing period.",
  },
];

// ── Usage Mini-Meter ─────────────────────────────────────────────────────────

function MiniMeter({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  unit: string;
}) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const isWarning = !isUnlimited && pct >= 80;
  const isExhausted = !isUnlimited && pct >= 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
        <span
          className={`font-medium ${
            isExhausted
              ? 'text-red-600 dark:text-red-400'
              : isWarning
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-neutral-600 dark:text-neutral-300'
          }`}
        >
          {isUnlimited ? (
            <span className="flex items-center gap-1">
              <InfinityIcon className="w-3 h-3" /> Unlimited
            </span>
          ) : (
            `${used.toFixed(unit === 'hrs' ? 1 : 0)} / ${limit} ${unit}`
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isExhausted
                ? 'bg-red-500'
                : isWarning
                  ? 'bg-amber-500'
                  : 'bg-neutral-400 dark:bg-neutral-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { data, isLoading } = useBillingUsage();
  const { openUpgradeModal } = useUIStore();

  const plan = data?.plan ?? 'FREE';
  const isProOrBusiness = plan === 'PRO' || plan === 'BUSINESS';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    // toast would need Toaster, using alert as simple fallback — the toast is already global
    import('sonner').then(({ toast }) =>
      toast.success('Email copied — ' + SUPPORT_EMAIL)
    );
  };

  return (
    <PageMotion>
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Pricing
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Your current plan and what's available on Pro.
          </p>
        </div>

        {/* Current usage snapshot — only shown when data is loaded */}
        {!isLoading && data && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold mb-1">
                  Current plan
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    plan === 'PRO'
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                      : plan === 'BUSINESS'
                        ? 'bg-neutral-700 text-white dark:bg-neutral-200 dark:text-neutral-900'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {plan.charAt(0) + plan.slice(1).toLowerCase()}
                </span>
              </div>
              {!isProOrBusiness && (
                <Button size="sm" onClick={() => openUpgradeModal()}>
                  <Zap className="w-3.5 h-3.5" />
                  Upgrade to Pro
                </Button>
              )}
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3.5">
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                This month's usage
              </p>
              <MiniMeter
                label="Transcription"
                used={data.usage.transcriptionMinutes}
                limit={data.limits.transcriptionMinutes}
                unit="min"
              />
              <MiniMeter
                label="AI Credits"
                used={data.usage.aiCredits}
                limit={data.limits.aiCredits}
                unit="credits"
              />
              <MiniMeter
                label="Auto-record & Transcribe (Google Meet)"
                used={data.usage.recallHours}
                limit={data.limits.recallHours}
                unit="hrs"
              />
              <MiniMeter
                label="Storage"
                used={data.usage.storageGb}
                limit={data.limits.storageGb}
                unit="GB"
              />
              {data.resetAt && (
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-1">
                  Resets{' '}
                  {new Date(data.resetAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Plan comparison cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free */}
          <div
            className={`rounded-2xl border p-6 flex flex-col gap-5 ${
              plan === 'FREE'
                ? 'border-neutral-900 dark:border-neutral-100 ring-1 ring-neutral-900 dark:ring-neutral-100'
                : 'border-neutral-200 dark:border-neutral-800'
            } bg-white dark:bg-neutral-900`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Free
                </p>
                {plan === 'FREE' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    Current
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-neutral-950 dark:text-neutral-50">
                ₹0
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                forever
              </p>
            </div>
            <ul className="space-y-2 flex-1">
              {FREE_BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                >
                  <Check className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full h-9 rounded-xl text-xs font-medium text-neutral-400 cursor-default"
              disabled
            >
              Your current plan
            </Button>
          </div>

          {/* Pro */}
          <div
            className={`rounded-2xl border flex flex-col gap-0 relative overflow-hidden ${
              plan === 'PRO'
                ? 'border-neutral-900 dark:border-neutral-100 ring-1 ring-neutral-900 dark:ring-neutral-100'
                : 'border-neutral-300 dark:border-neutral-600'
            } bg-white dark:bg-neutral-900`}
          >
            {/* Dark header block */}
            <div className="bg-neutral-950 px-6 pt-5 pb-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Pro
                </p>
                {plan !== 'PRO' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white">
                    Recommended
                  </span>
                )}
                {plan === 'PRO' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                    Current
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold tracking-tight">₹1,499</p>
              <p className="text-xs text-white/50 mt-0.5">per month</p>
            </div>

            <div className="p-6 flex flex-col gap-5 flex-1">
              <ul className="space-y-2 flex-1">
                {PRO_BULLETS.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <Check className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              {plan === 'PRO' ? (
                <button
                  disabled
                  className="w-full h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-400 cursor-default"
                >
                  Active plan
                </button>
              ) : (
                <Button
                  className="w-full h-9 rounded-xl"
                  onClick={() => openUpgradeModal()}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* What you get comparison table */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Free vs Pro — at a glance
            </p>
          </div>
          <div className="divide-y divide-neutral-50 dark:divide-neutral-800/80">
            {PLAN_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className="flex items-center px-6 py-3.5 gap-3"
                >
                  <Icon className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">
                    {f.label}
                  </span>
                  <span className="text-xs text-neutral-400 w-24 text-right">
                    {f.free}
                  </span>
                  <ArrowRight className="w-3 h-3 text-neutral-300 dark:text-neutral-600 shrink-0" />
                  <span
                    className={`text-xs font-medium w-24 text-right ${
                      f.pro === '—'
                        ? 'text-neutral-300'
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {f.pro}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Frequently asked questions
          </p>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            {FAQS.map((faq) => (
              <div key={faq.q} className="px-6 py-4">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  {faq.q}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA footer */}
        {!isProOrBusiness && (
          <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-0.5">Ready to upgrade?</p>
              <p className="text-xs text-neutral-400">
                Email us and we'll switch your account within 24 hours.
                Self-serve payments coming soon.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                onClick={handleCopyEmail}
              >
                <Mail className="w-3.5 h-3.5" />
                {SUPPORT_EMAIL}
              </Button>
              <a
                href={`${PUBLIC_URL}/pricing`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-white/20 text-white text-xs font-medium hover:bg-white/10 transition-colors"
              >
                See full pricing
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </PageMotion>
  );
}
