import {
  Calendar,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Video,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type MeetingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

type Meeting = {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: string[];
  status: MeetingStatus;
  type: 'google-meet' | 'zoom' | 'in-person';
  location?: string;
};

export default function Meetings() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const meetings: Meeting[] = [
    {
      id: 1,
      title: 'Product Review Meeting',
      date: '2026-02-10',
      time: '2:00 PM',
      duration: '30 min',
      participants: ['John Doe', 'Jane Smith'],
      status: 'confirmed',
      type: 'google-meet',
    },
    {
      id: 2,
      title: 'Team Sync',
      date: '2026-02-10',
      time: '3:30 PM',
      duration: '1 hour',
      participants: ['Team Alpha'],
      status: 'confirmed',
      type: 'zoom',
    },
    {
      id: 3,
      title: 'Client Presentation',
      date: '2026-02-11',
      time: '10:00 AM',
      duration: '45 min',
      participants: ['Acme Corp', 'Sarah Lee'],
      status: 'pending',
      type: 'google-meet',
    },
    {
      id: 4,
      title: 'Design Review',
      date: '2026-02-11',
      time: '2:00 PM',
      duration: '30 min',
      participants: ['Sarah Lee'],
      status: 'confirmed',
      type: 'in-person',
      location: 'Conference Room A',
    },
    {
      id: 5,
      title: 'Weekly Standup',
      date: '2026-02-08',
      time: '9:00 AM',
      duration: '15 min',
      participants: ['Dev Team'],
      status: 'completed',
      type: 'google-meet',
    },
    {
      id: 6,
      title: 'Cancelled Meeting',
      date: '2026-02-09',
      time: '4:00 PM',
      duration: '30 min',
      participants: ['Bob Wilson'],
      status: 'cancelled',
      type: 'zoom',
    },
  ];

  const getStatusVariant = (status: MeetingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getMeetingIcon = (type: Meeting['type']) => {
    switch (type) {
      case 'google-meet':
      case 'zoom':
        return <Video className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case 'in-person':
        return <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 mb-1 tracking-tight">
            Meetings
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Manage your scheduled and past meetings
          </p>
        </div>
        <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900">
          <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Create Meeting
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-10 border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-auto border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400"
            />
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">to</span>
            <Input
              type="date"
              className="w-auto border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm 
                         focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400
                         focus:border-transparent text-neutral-950 dark:text-neutral-100 cursor-pointer bg-white dark:bg-neutral-800"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings Table */}
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
                      {meeting.type === 'in-person'
                        ? meeting.location
                        : meeting.type
                            .split('-')
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')}
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
            Showing 1-6 of 6 meetings
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
    </div>
  );
}
