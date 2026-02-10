import { MapPin, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import type { Meeting } from '@/types';

type NextMeetingCardProps = {
  meeting: Meeting | undefined;
};

export function NextMeetingCard({ meeting }: NextMeetingCardProps) {
  const navigate = useNavigate();

  if (!meeting) {
    return (
      <Card className="p-5 border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-400 dark:text-neutral-500 font-medium mb-4">
          <Clock className="w-4 h-4" />
          NEXT UP
        </div>
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          No more meetings today — enjoy the free time.
        </p>
      </Card>
    );
  }

  return (
    <Card
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      className="p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden cursor-pointer hover:shadow-md transition-all">
      {/* Top accent bar */}
      <div className="h-1 bg-neutral-900 dark:bg-neutral-100" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-400 dark:text-neutral-500 font-medium">
            <Clock className="w-4 h-4" />
            NEXT UP
          </div>
          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
            in 32 min
          </span>
        </div>

        {/* Meeting title */}
        <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-3">
          {meeting.title}
        </h3>

        {/* Details row */}
        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {meeting.time} · {meeting.duration}
          </span>
        </div>

        {/* Location */}
        {meeting.location && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            <MapPin className="w-3.5 h-3.5" />
            {meeting.location}
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Users className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          <div className="flex items-center gap-1">
            {meeting.participants.slice(0, 3).map((p, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-medium text-neutral-600 dark:text-neutral-300"
              >
                {p.charAt(0)}
              </div>
            ))}
            {meeting.participants.length > 3 && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-1">
                +{meeting.participants.length - 3}
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto">
            {meeting.participants.length} participant
            {meeting.participants.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Org source badge (only shown in personal workspace / aggregated view) */}
        {meeting.orgSource && !meeting.orgSource.isPersonal && (
          <div className="mt-3">
            <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              {meeting.orgSource.orgName}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
