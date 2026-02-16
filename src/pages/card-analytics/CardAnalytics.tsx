import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Users,
  MousePointerClick,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCard, useCardAnalytics } from '@/hooks/queries/useCardQueries';

const TIME_RANGES = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
];

export default function CardAnalytics() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [days, setDays] = useState(30);

  const { data: card } = useCard(id ?? '');
  const { data: analytics, isLoading } = useCardAnalytics(id ?? '', days);

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
        <p className="text-neutral-500 text-sm">No analytics data available</p>
      </div>
    );
  }

  const maxViews = Math.max(
    ...(analytics.viewsByDay?.map((d) => d.count) ?? [1]),
    1
  );
  const maxClicks = Math.max(
    ...(analytics.linkClicks?.map((d) => d.count) ?? [1]),
    1
  );
  const maxCountry = Math.max(
    ...(analytics.topCountries?.map((d) => d.count) ?? [1]),
    1
  );

  return (
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

        {/* Time range */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setDays(range.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                days === range.value
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
            {analytics.totalViews}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Total Views
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
            {analytics.uniqueViews}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Unique Visitors
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
            {analytics.totalContacts}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Contacts
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
            {analytics.conversionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Conversion Rate
          </p>
        </Card>
      </div>

      {/* Views by Day Chart */}
      {analytics.viewsByDay?.length > 0 && (
        <Card className="p-5 mb-6">
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-4">
            Views Over Time
          </h3>
          <div className="flex items-end gap-1 h-40">
            {analytics.viewsByDay.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-blue-500/80 dark:bg-blue-400/60 transition-all min-h-[2px]"
                  style={{ height: `${(day.count / maxViews) * 100}%` }}
                />
                {analytics.viewsByDay.length <= 14 && (
                  <span className="text-[9px] text-neutral-400 whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString('en', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
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
                    <span className="text-xs font-medium text-neutral-500 ml-2">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500/70 dark:bg-violet-400/50 transition-all"
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
                    <span className="text-xs font-medium text-neutral-500">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500/70 dark:bg-emerald-400/50 transition-all"
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
  );
}
