import { Users, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const meetingCategories = [
  { label: '1:1', count: 8 },
  { label: 'STANDUP', count: 12 },
  { label: 'CLIENT', count: 5 },
  { label: 'REVIEW', count: 6 },
  { label: 'OTHER', count: 3 },
];

type MeetingSummaryCardProps = {
  isPersonalView?: boolean;
  isTeamView?: boolean;
};

export function MeetingSummaryCard({
  isPersonalView,
  isTeamView,
}: MeetingSummaryCardProps) {
  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            MEETING SUMMARY
          </span>
          <Badge
            variant="outline"
            className="text-[10px] rounded-full border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400"
          >
            {monthLabel}
          </Badge>
          {isPersonalView && (
            <Badge
              variant="outline"
              className="text-[10px] rounded-full border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500"
            >
              All orgs
            </Badge>
          )}
          {isTeamView && (
            <Badge
              variant="outline"
              className="text-[10px] rounded-full border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
            >
              Team
            </Badge>
          )}
        </div>
        <button className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer">
          Details <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 border-t border-neutral-100 dark:border-neutral-800">
        {meetingCategories.map((cat, i) => (
          <div
            key={cat.label}
            className={`p-5 ${i < 4 ? 'border-r border-neutral-100 dark:border-neutral-800' : ''}`}
          >
            <div className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
              {cat.count}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 tracking-wide">
              {cat.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
