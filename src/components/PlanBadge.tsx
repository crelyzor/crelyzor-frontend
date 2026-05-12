import type { Plan } from '@/types/organization';

const BADGE_CONFIG = {
  PRO: {
    label: 'PRO',
    className: 'border-[#d4af61] text-[#d4af61]',
  },
  BUSINESS: {
    label: 'BUSINESS',
    className: 'border-[#6366f1] text-[#6366f1]',
  },
} as const;

export function PlanBadge({ plan }: { plan: Plan }) {
  if (!plan || plan === 'FREE') return null;
  const config = BADGE_CONFIG[plan as keyof typeof BADGE_CONFIG];
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}
