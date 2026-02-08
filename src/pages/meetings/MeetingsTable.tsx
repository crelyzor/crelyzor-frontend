import { Clock, MoreVertical, Video, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ScheduledMeeting, MeetingStatus, MeetingPlatform } from '@/types';

type MeetingsTableProps = {
  meetings: ScheduledMeeting[];
};

function getStatusVariant(status: MeetingStatus) {
  switch (status) {
    case 'confirmed':
      return 'default' as const;
    case 'pending':
      return 'secondary' as const;
    case 'cancelled':
      return 'destructive' as const;
    case 'completed':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
}

function getMeetingIcon(type: MeetingPlatform) {
  switch (type) {
    case 'google-meet':
    case 'zoom':
      return <Video className="w-3.5 h-3.5" strokeWidth={1.5} />;
    case 'in-person':
      return <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />;
  }
}

function formatPlatformLabel(type: MeetingPlatform, location?: string) {
  if (type === 'in-person') return location;
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function MeetingsTable({ meetings }: MeetingsTableProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-neutral-200 dark:border-neutral-800">
            <TableHead className="text-neutral-950 dark:text-neutral-100 font-medium">
              Date & Time
            </TableHead>
            <TableHead className="text-neutral-950 dark:text-neutral-100 font-medium">
              Meeting
            </TableHead>
            <TableHead className="text-neutral-950 dark:text-neutral-100 font-medium">
              Participants
            </TableHead>
            <TableHead className="text-neutral-950 dark:text-neutral-100 font-medium">
              Duration
            </TableHead>
            <TableHead className="text-neutral-950 dark:text-neutral-100 font-medium">
              Status
            </TableHead>
            <TableHead className="text-neutral-950 dark:text-neutral-100 font-medium">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow
              key={meeting.id}
              className="hover:bg-neutral-50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
            >
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="text-neutral-950 dark:text-neutral-100 font-medium text-sm">
                    {new Date(meeting.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {meeting.time}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="text-neutral-950 dark:text-neutral-100 font-medium text-sm">
                    {meeting.title}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    {getMeetingIcon(meeting.type)}
                    {formatPlatformLabel(meeting.type, meeting.location)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {meeting.participants.join(', ')}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {meeting.duration}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getStatusVariant(meeting.status)}
                  className="capitalize text-[11px] font-medium"
                >
                  {meeting.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Showing 1-{meetings.length} of {meetings.length} meetings
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
