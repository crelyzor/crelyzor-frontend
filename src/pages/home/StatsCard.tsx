import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function StatsCard() {
  return (
    <Card className="md:col-span-2 p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-5 pb-3 flex items-center gap-2 text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
        <TrendingUp className="w-4 h-4" />
        THIS WEEK
      </div>
      <div className="px-5 space-y-5">
        <div>
          <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            12
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
            Total Meetings
          </p>
        </div>
        <div>
          <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            8.5
            <span className="text-lg font-normal text-neutral-400 dark:text-neutral-500">
              hrs
            </span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
            Time in Meetings
          </p>
        </div>
        <div>
          <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            7
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
            Recordings
          </p>
        </div>
      </div>
      <div className="p-5 pt-4">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          Weekly avg: 10 meetings, 7.2 hrs,
          <br />
          calculated over last four weeks.
        </p>
      </div>
    </Card>
  );
}
