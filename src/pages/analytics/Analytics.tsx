import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CalendarDays,
  FileText,
  Mic,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// ── Mock analytics data ──
const myAnalytics = {
  thisWeek: { meetings: 12, hours: 8.5, avgDuration: 42 },
  lastWeek: { meetings: 10, hours: 7.2, avgDuration: 38 },
  categoryBreakdown: [
    { label: '1:1', count: 8, percentage: 24 },
    { label: 'Standup', count: 12, percentage: 35 },
    { label: 'Client', count: 5, percentage: 15 },
    { label: 'Review', count: 6, percentage: 18 },
    { label: 'Internal', count: 3, percentage: 8 },
  ],
  statusBreakdown: [
    { label: 'Completed', count: 28, color: 'bg-emerald-500' },
    { label: 'Confirmed', count: 4, color: 'bg-blue-500' },
    { label: 'Pending', count: 2, color: 'bg-amber-500' },
    { label: 'Cancelled', count: 1, color: 'bg-red-500' },
  ],
  dailyMeetings: [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 3 },
    { day: 'Wed', count: 5 },
    { day: 'Thu', count: 2 },
    { day: 'Fri', count: 3 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 },
  ],
  topParticipants: [
    { name: 'Sarah Chen', meetings: 8 },
    { name: 'Mike Ross', meetings: 6 },
    { name: 'Emma Wilson', meetings: 5 },
    { name: 'Alex Kim', meetings: 4 },
    { name: 'Priya Sharma', meetings: 3 },
  ],
  sma: { recordings: 7, transcribed: 5, summarized: 4, actionItems: 12 },
};

type TimeRange = 'week' | 'month' | 'quarter';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const data = myAnalytics;
  const maxDaily = Math.max(...data.dailyMeetings.map((d) => d.count), 1);

  // Compute deltas
  const meetingDelta = data.thisWeek.meetings - data.lastWeek.meetings;
  const hoursDelta = +(data.thisWeek.hours - data.lastWeek.hours).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Meeting insights & activity overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range pills */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer capitalize ${
                  timeRange === range
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Meetings"
          value={data.thisWeek.meetings}
          delta={meetingDelta}
          icon={CalendarDays}
        />
        <KPICard
          label="Hours"
          value={data.thisWeek.hours}
          delta={hoursDelta}
          suffix="hrs"
          icon={Clock}
        />
        <KPICard
          label="Avg Duration"
          value={data.thisWeek.avgDuration}
          delta={data.thisWeek.avgDuration - data.lastWeek.avgDuration}
          suffix="min"
          icon={Clock}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Daily meetings bar chart */}
        <Card className="col-span-3 border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium mb-4">
              MEETINGS THIS WEEK
            </h3>
            <div className="flex items-end gap-3 h-36">
              {data.dailyMeetings.map((d) => (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-[11px] font-medium text-neutral-900 dark:text-neutral-100">
                    {d.count || ''}
                  </span>
                  <div className="w-full relative">
                    <div
                      className="w-full bg-neutral-900 dark:bg-neutral-100 rounded-t-md transition-all"
                      style={{
                        height: `${Math.max((d.count / maxDaily) * 100, d.count > 0 ? 8 : 0)}px`,
                        minHeight: d.count > 0 ? '8px' : '2px',
                      }}
                    />
                    {d.count === 0 && (
                      <div className="w-full h-0.5 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card className="col-span-2 border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium mb-4">
              BY STATUS
            </h3>
            <div className="space-y-3">
              {data.statusBreakdown.map((s) => {
                const total = data.statusBreakdown.reduce(
                  (a, b) => a + b.count,
                  0
                );
                const pct = Math.round((s.count / total) * 100);
                return (
                  <div key={s.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {s.label}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {s.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Category + Participants + SMA ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Category breakdown */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium mb-4">
              BY CATEGORY
            </h3>
            <div className="space-y-3">
              {data.categoryBreakdown.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {cat.count}
                    </span>
                    <span className="text-[10px] text-neutral-400 w-8 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top participants */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium mb-4">
              TOP PARTICIPANTS
            </h3>
            <div className="space-y-3">
              {data.topParticipants.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-neutral-400 w-4">
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 truncate block">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {p.meetings}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SMA overview */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <h3 className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium mb-4 flex items-center gap-2">
              SMART MEETING ASSISTANT
            </h3>
            <div className="space-y-4">
              <SMAMetric
                label="Recordings"
                value={data.sma.recordings}
                icon={Mic}
              />
              <SMAMetric
                label="Transcribed"
                value={data.sma.transcribed}
                icon={BarChart3}
              />
              <SMAMetric
                label="AI Summaries"
                value={data.sma.summarized}
                icon={FileText}
              />
              <SMAMetric
                label="Action Items"
                value={data.sma.actionItems}
                icon={CalendarDays}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── KPI Card ──
function KPICard({
  label,
  value,
  delta,
  suffix,
  icon: Icon,
}: {
  label: string;
  value: number;
  delta: number;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  return (
    <Card className="border-neutral-200 dark:border-neutral-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </div>
          {!isNeutral && (
            <span
              className={`flex items-center gap-0.5 text-[11px] font-medium ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? '+' : ''}
              {delta}
            </span>
          )}
        </div>
        <div className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
          {value}
          {suffix && (
            <span className="text-sm font-normal text-neutral-400 dark:text-neutral-500 ml-1">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mt-0.5">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

// ── SMA Metric ──
function SMAMetric({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            highlight
              ? 'bg-violet-50 dark:bg-violet-950/30'
              : 'bg-neutral-100 dark:bg-neutral-800'
          }`}
        >
          <Icon
            className={`w-3.5 h-3.5 ${
              highlight
                ? 'text-violet-500 dark:text-violet-400'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          />
        </div>
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );
}
