import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import {
  ArrowLeft,
  Eye,
  Users,
  MousePointerClick,
  TrendingUp,
  Globe,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCard, useCardAnalytics } from '@/hooks/queries/useCardQueries';

const TIME_RANGES = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
];

// Compute trend: compare sum of second half vs first half of viewsByDay
function computeTrend(
  viewsByDay: { date: string; count: number }[]
): number | null {
  if (viewsByDay.length < 4) return null;
  const mid = Math.floor(viewsByDay.length / 2);
  const firstHalf = viewsByDay.slice(0, mid).reduce((s, d) => s + d.count, 0);
  const secondHalf = viewsByDay.slice(mid).reduce((s, d) => s + d.count, 0);
  if (firstHalf === 0) return null;
  const pct = ((secondHalf - firstHalf) / firstHalf) * 100;
  // Cap at ±999% to avoid absurd numbers
  return Math.max(-999, Math.min(999, pct));
}

// Pure SVG sparkline — no external deps
function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  const W = 600;
  const H = 100;
  const PAD = 4;

  const counts = data.map((d) => d.count);
  const maxVal = Math.max(...counts, 1);

  if (data.length === 0) return null;

  if (data.length === 1) {
    // Single point — flat line
    const y = H / 2;
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <line
          x1={PAD}
          y1={y}
          x2={W - PAD}
          y2={y}
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-neutral-300 dark:text-neutral-600"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (d.count / maxVal) * (H - PAD * 2);
    return { x, y };
  });

  const polylinePoints = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = [
    `M ${pts[0].x},${pts[0].y}`,
    ...pts.slice(1).map((p) => `L ${p.x},${p.y}`),
    `L ${pts[pts.length - 1].x},${H}`,
    `L ${pts[0].x},${H}`,
    'Z',
  ].join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      {/* Area fill */}
      <path
        d={areaPath}
        fill="currentColor"
        className="text-neutral-900 dark:text-neutral-100"
        opacity="0.06"
      />
      {/* Line */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-neutral-600 dark:text-neutral-400"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CardAnalytics() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [days, setDays] = useState(30);

  const { data: card } = useCard(id ?? '');
  const {
    data: analytics,
    isLoading,
    isError,
  } = useCardAnalytics(id ?? '', days);

  const trend = useMemo(
    () => (analytics?.viewsByDay ? computeTrend(analytics.viewsByDay) : null),
    [analytics?.viewsByDay]
  );

  const maxClicks = useMemo(
    () => Math.max(...(analytics?.linkClicks?.map((d) => d.count) ?? [1]), 1),
    [analytics?.linkClicks]
  );
  const maxCountry = useMemo(
    () => Math.max(...(analytics?.topCountries?.map((d) => d.count) ?? [1]), 1),
    [analytics?.topCountries]
  );

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Failed to load analytics
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          No analytics data available
        </p>
      </div>
    );
  }

  return (
    <PageMotion>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => navigate('/cards')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                Analytics
              </h1>
              {card && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {card.displayName} · /{card.slug}
                </p>
              )}
            </div>
          </div>

          {/* Time range toggle */}
          <div className="flex items-center gap-0.5 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                onClick={() => setDays(range.value)}
                className={`px-3 py-1.5 h-auto text-xs font-medium transition-colors ${
                  days === range.value
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm hover:bg-white dark:hover:bg-neutral-700'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Views — with trend */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Eye className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
              {trend !== null && (
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    trend > 0
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                      : trend < 0
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {trend > 0 ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : trend < 0 ? (
                    <TrendingDown className="w-2.5 h-2.5" />
                  ) : (
                    <Minus className="w-2.5 h-2.5" />
                  )}
                  {trend > 0 ? '+' : ''}
                  {trend.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
              {analytics.totalViews}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Total Views
            </p>
          </Card>

          {/* Unique Visitors */}
          <Card className="p-4">
            <div className="mb-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Users className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
              {analytics.uniqueViews}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Unique Visitors
            </p>
          </Card>

          {/* Contacts */}
          <Card className="p-4">
            <div className="mb-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
              {analytics.totalContacts}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Contacts
            </p>
          </Card>

          {/* Conversion Rate */}
          <Card className="p-4">
            <div className="mb-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
              {(analytics.conversionRate ?? 0).toFixed(1)}%
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Conversion Rate
            </p>
          </Card>
        </div>

        {/* SVG Sparkline — Views Over Time */}
        {analytics.viewsByDay?.length > 0 && (
          <Card className="p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                Views Over Time
              </h3>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {analytics.viewsByDay.length} days
              </span>
            </div>

            {/* Sparkline */}
            <div className="h-28 w-full">
              <Sparkline data={analytics.viewsByDay} />
            </div>

            {/* Date labels — only when ≤14 days */}
            {analytics.viewsByDay.length <= 14 && (
              <div className="flex justify-between mt-2">
                {analytics.viewsByDay
                  .filter(
                    (_, i, arr) =>
                      i === 0 ||
                      i === arr.length - 1 ||
                      (arr.length <= 7 && true)
                  )
                  .map((day, i) => (
                    <span
                      key={i}
                      className="text-[9px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap"
                    >
                      {new Date(day.date + 'T00:00:00').toLocaleDateString(
                        'en',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </span>
                  ))}
              </div>
            )}

            {/* Start / End labels for longer ranges */}
            {analytics.viewsByDay.length > 14 && (
              <div className="flex justify-between mt-2">
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500">
                  {new Date(
                    analytics.viewsByDay[0].date + 'T00:00:00'
                  ).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500">
                  {new Date(
                    analytics.viewsByDay[analytics.viewsByDay.length - 1].date +
                      'T00:00:00'
                  ).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Link Clicks */}
          {analytics.linkClicks?.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-4">
                Link Clicks
              </h3>
              <div className="space-y-3">
                {analytics.linkClicks.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]">
                        {item.link}
                      </span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 ml-2 shrink-0">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neutral-400 dark:bg-neutral-500 transition-all"
                        style={{ width: `${(item.count / maxClicks) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Countries */}
          {analytics.topCountries?.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-neutral-400" />
                Top Locations
              </h3>
              <div className="space-y-3">
                {analytics.topCountries.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-700 dark:text-neutral-300">
                        {item.country || 'Unknown'}
                      </span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neutral-400 dark:bg-neutral-500 transition-all"
                        style={{ width: `${(item.count / maxCountry) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageMotion>
  );
}
