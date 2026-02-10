import {
  Clock,
  Mic,
  Sparkles,
  ClipboardList,
  FileText,
  MapPin,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCategoryStyle } from '@/constants';
import type { Meeting } from '@/types';

type RecentMeetingsProps = {
  meetings: Meeting[];
  isPersonalView?: boolean;
  isTeamView?: boolean;
};

export function RecentMeetings({
  meetings,
  isPersonalView,
  isTeamView,
}: RecentMeetingsProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
          RECENT MEETINGS
          {isTeamView && (
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded ml-1">
              Team
            </span>
          )}
        </h2>
        <button
          onClick={() => navigate('/meetings')}
          className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-medium cursor-pointer"
        >
          SEE ALL
        </button>
      </div>

      <div className="space-y-3">
        {meetings.map((meeting) => (
          <Card
            key={meeting.id}
            onClick={() => navigate(`/meetings/${meeting.id}`)}
            className="p-4 border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate flex-1">
                {meeting.title}
              </span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 ml-2 whitespace-nowrap">
                {meeting.date}, {meeting.time}
              </span>
            </div>

            {/* Location */}
            {meeting.location && (
              <div className="flex items-center gap-1 mb-2 text-xs text-neutral-400 dark:text-neutral-500">
                <MapPin className="w-3 h-3" />
                <span>{meeting.location}</span>
                {/* Organizer in team view */}
                {isTeamView && meeting.organizer && (
                  <>
                    <span className="mx-1">&middot;</span>
                    <User className="w-3 h-3" />
                    <span>{meeting.organizer}</span>
                  </>
                )}
              </div>
            )}
            {/* Organizer fallback when no location */}
            {!meeting.location && isTeamView && meeting.organizer && (
              <div className="flex items-center gap-1 mb-2 text-xs text-neutral-400 dark:text-neutral-500">
                <User className="w-3 h-3" />
                <span>{meeting.organizer}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Duration */}
                <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                  <Clock className="w-3 h-3" />
                  <span>{meeting.duration}</span>
                </div>

                {/* SMA indicators — subtle icons showing what's inside */}
                <div className="flex items-center gap-1.5 ml-1">
                  {meeting.hasRecording && (
                    <Mic className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                  )}
                  {meeting.hasTranscript && (
                    <FileText className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                  )}
                  {meeting.hasSummary && (
                    <Sparkles className="w-3 h-3 text-violet-400 dark:text-violet-400" />
                  )}
                  {meeting.hasActionItems && (
                    <ClipboardList className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Org badge in personal view */}
                {isPersonalView &&
                  meeting.orgSource &&
                  !meeting.orgSource.isPersonal && (
                    <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                      {meeting.orgSource.orgName}
                    </span>
                  )}
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium border ${getCategoryStyle(meeting.category)}`}
                >
                  {meeting.category}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
