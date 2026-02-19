import { Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import type { DisplayMeeting } from '@/lib/meetingHelpers';

type ScheduleCardProps = {
  meetings: DisplayMeeting[];
};

export function ScheduleCard({ meetings }: ScheduleCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="md:col-span-3 p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
          <Calendar className="w-4 h-4" />
          TODAY&apos;S SCHEDULE
        </div>
      </div>
      <div className="px-5 pb-2">
        <div className="text-4xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
          {meetings.length}
          <span className="text-lg font-normal text-neutral-400 dark:text-neutral-500 ml-2">
            meetings left
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3">
        <div className="space-y-0">
          {meetings.map((meeting, i) => (
            <div
              key={meeting.id}
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              className="flex items-start gap-3 group cursor-pointer"
            >
              <div className="flex flex-col items-center pt-1.5">
                <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                {i < meetings.length - 1 && (
                  <div className="w-px h-12 bg-neutral-200 dark:bg-neutral-700" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
                    {meeting.title}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {meeting.duration}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {meeting.time}
                  </span>
                  {meeting.location && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                      <MapPin className="w-3 h-3" />
                      {meeting.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
