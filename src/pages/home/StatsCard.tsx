import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const stats = {
  totalMeetings: 12,
  hours: 8.5,
  avgMeetings: 10,
  avgHours: 7.2,
};

export function StatsCard() {
  const navigate = useNavigate();

  return (
    <Card className="md:col-span-2 p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
          <TrendingUp className="w-4 h-4" />
          THIS WEEK
        </div>
      </div>
      <div className="px-5 space-y-5">
        <div
          onClick={() => navigate('/meetings')}
          className="cursor-pointer hover:opacity-70 transition-opacity"
        >
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
      </div>
      <div className="p-5 pt-4">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          Weekly avg: {stats.avgMeetings} meetings, {stats.avgHours} hrs
        </p>
      </div>
    </Card>
  );
}
