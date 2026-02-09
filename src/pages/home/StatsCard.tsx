import { TrendingUp, Mic } from 'lucide-react';
import { Card } from '@/components/ui/card';

type StatsCardProps = {
  isTeamView?: boolean;
};

const myStats = {
  totalMeetings: 12,
  hours: 8.5,
  recordings: 7,
  avgMeetings: 10,
  avgHours: 7.2,
};

const teamStats = {
  totalMeetings: 34,
  hours: 22,
  recordings: 18,
  avgMeetings: 28,
  avgHours: 19,
};

export function StatsCard({ isTeamView }: StatsCardProps) {
  const stats = isTeamView ? teamStats : myStats;

  return (
    <Card className="md:col-span-2 p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
          <TrendingUp className="w-4 h-4" />
          THIS WEEK
        </div>
      </div>
      <div className="px-5 space-y-5">
        <div>
          <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            {stats.totalMeetings}
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
            Total Meetings
          </p>
        </div>
        <div>
          <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            {stats.hours}
            <span className="text-lg font-normal text-neutral-400 dark:text-neutral-500">
              hrs
            </span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
            Time in Meetings
          </p>
        </div>
        <div>
          <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 flex items-baseline gap-1.5">
            {stats.recordings}
            <Mic className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
            Recordings
          </p>
        </div>
      </div>
      <div className="p-5 pt-4">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          Weekly avg: {stats.avgMeetings} meetings, {stats.avgHours} hrs
        </p>
      </div>
    </Card>
  );
}
