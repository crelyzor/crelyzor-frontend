/**
 * Phase 6 P11.c — Team Usage tab.
 *
 * Admin+ only. Renders:
 *   - 4 summary cards (Transcription / Recall / AI / Storage) against owner's plan limits
 *   - "This month" header + reset date
 *   - Per-member breakdown table
 *   - CSV export (client-side)
 *
 * Members see a permission copy and no fetch fires.
 */
import { useMemo } from 'react';
import {
  BarChart3,
  Bot,
  Download,
  HardDrive,
  Mic,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTeamUsage } from '@/hooks/queries/useTeamQueries';
import type {
  TeamRole,
  TeamUsageMemberRow,
  TeamUsageResponse,
} from '@/services/teamService';

const ROLE_BADGE: Record<TeamRole, string> = {
  OWNER:
    'inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-neutral-700 dark:text-neutral-200',
  ADMIN:
    'inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-neutral-500 dark:text-neutral-400',
  MEMBER:
    'inline-flex items-center rounded-full border border-transparent bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-neutral-500 dark:text-neutral-400',
};

function formatStorage(gb: number): string {
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = gb * 1024;
  if (mb >= 1) return `${mb.toFixed(0)} MB`;
  return `${(mb * 1024).toFixed(0)} KB`;
}

function formatLimit(
  value: number,
  kind: 'minutes' | 'hours' | 'credits' | 'gb'
): string {
  if (value === -1) return 'Unlimited';
  if (value === 0 && kind === 'hours') return 'Not on this plan';
  if (kind === 'gb') return `${value} GB`;
  if (kind === 'minutes') return `${value} min`;
  if (kind === 'hours') return `${value} h`;
  return `${value}`;
}

function formatResetDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Props {
  teamId: string;
  role: TeamRole;
}

export function UsageSection({ teamId, role }: Props) {
  const canView = role === 'OWNER' || role === 'ADMIN';
  const { data, isLoading } = useTeamUsage(canView ? teamId : null);

  if (!canView) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Team usage"
          description="Only owners and admins can see team usage."
        />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Team usage" description="" />
        <UsageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SectionHeader
          title="Team usage"
          description={`This period · resets ${formatResetDate(data.resetAt)}`}
        />
        <ExportButton data={data} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Transcription"
          icon={Mic}
          used={data.summary.transcriptionMinutes}
          limit={data.ownerLimits.transcriptionMinutes}
          kind="minutes"
        />
        <SummaryCard
          label="Recall hours"
          icon={Bot}
          used={data.summary.recallHours}
          limit={data.ownerLimits.recallHours}
          kind="hours"
          fractional
        />
        <SummaryCard
          label="AI credits"
          icon={Sparkles}
          used={data.summary.aiCredits}
          limit={data.ownerLimits.aiCredits}
          kind="credits"
        />
        <SummaryCard
          label="Storage"
          icon={HardDrive}
          used={data.summary.storageGb}
          limit={data.ownerLimits.storageGb}
          kind="gb"
        />
      </div>

      {/* Per-member breakdown */}
      <BreakdownTable rows={data.breakdown} />
    </div>
  );
}

// ── Summary card ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  icon: Icon,
  used,
  limit,
  kind,
  fractional,
}: {
  label: string;
  icon: React.ElementType;
  used: number;
  limit: number;
  kind: 'minutes' | 'hours' | 'credits' | 'gb';
  fractional?: boolean;
}) {
  const unlimited = limit === -1;
  const unavailable = limit === 0 && kind === 'hours';
  const showBar = !unlimited && !unavailable && limit > 0;
  const pct = showBar ? Math.min(100, (used / limit) * 100) : 0;

  const displayUsed = (() => {
    if (kind === 'gb') return formatStorage(used);
    if (fractional) return used.toFixed(1);
    if (kind === 'minutes' || kind === 'hours') {
      return Math.round(used).toLocaleString();
    }
    return used.toLocaleString();
  })();

  return (
    <Card className="border-neutral-200 dark:border-neutral-800">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            {label}
          </p>
          <Icon className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
        </div>
        <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
          {displayUsed}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          of {formatLimit(limit, kind)}
        </p>
        {showBar && (
          <div className="h-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-neutral-900 dark:bg-neutral-100 transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Breakdown table ─────────────────────────────────────────────────────────

function BreakdownTable({ rows }: { rows: TeamUsageMemberRow[] }) {
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => b.transcriptionMinutes - a.transcriptionMinutes),
    [rows]
  );
  const allZero = sorted.every(
    (r) =>
      r.transcriptionMinutes === 0 &&
      r.recallHours === 0 &&
      r.aiCredits === 0 &&
      r.storageGb === 0
  );

  if (allZero) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
        <BarChart3 className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          No usage yet this period
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Activity will appear here once team members start working.
        </p>
      </div>
    );
  }

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              <th className="text-left px-4 py-3 font-medium">Member</th>
              <th className="text-right px-3 py-3 font-medium">
                Transcription
              </th>
              <th className="text-right px-3 py-3 font-medium">Recall</th>
              <th className="text-right px-3 py-3 font-medium">AI credits</th>
              <th className="text-right px-4 py-3 font-medium">Storage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sorted.map((row) => (
              <BreakdownRow key={row.user.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function BreakdownRow({ row }: { row: TeamUsageMemberRow }) {
  const initials = (row.user.name ?? row.user.email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {row.user.avatarUrl ? (
            <img
              src={row.user.avatarUrl}
              alt={row.user.name ?? row.user.email}
              className="w-7 h-7 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {row.user.name ?? row.user.email}
              <span className={`ml-2 ${ROLE_BADGE[row.role]}`}>{row.role}</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {row.user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-sm text-neutral-700 dark:text-neutral-200">
        {Math.round(row.transcriptionMinutes).toLocaleString()} min
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-sm text-neutral-700 dark:text-neutral-200">
        {row.recallHours.toFixed(1)} h
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-sm text-neutral-700 dark:text-neutral-200">
        {row.aiCredits.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-sm text-neutral-700 dark:text-neutral-200">
        {formatStorage(row.storageGb)}
      </td>
    </tr>
  );
}

// ── CSV export ──────────────────────────────────────────────────────────────

function ExportButton({ data }: { data: TeamUsageResponse }) {
  const handleExport = () => {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const header = [
      'User',
      'Email',
      'Role',
      'Transcription minutes',
      'Recall hours',
      'AI credits',
      'Storage GB',
    ];
    const rows = data.breakdown.map((row) => [
      escape(row.user.name ?? ''),
      escape(row.user.email),
      row.role,
      Math.round(row.transcriptionMinutes).toString(),
      row.recallHours.toFixed(2),
      row.aiCredits.toString(),
      row.storageGb.toFixed(3),
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${data.team.slug}-usage-${dateStamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
}

// ── Skeleton + header ───────────────────────────────────────────────────────

function UsageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4 space-y-2">
              <div className="h-3 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="h-7 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="h-2 w-1/3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              <div className="flex-1 h-3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
