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

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#15803D] text-white';
      case 'pending':
        return 'bg-[#F59E0B] text-white';
      case 'cancelled':
        return 'bg-[#B91C1C] text-white';
      case 'completed':
        return 'bg-[#4A4A4A] text-white';
      default:
        return 'bg-[#E8E8E8] text-[#4A4A4A]';
    }
  };

  const getMeetingIcon = (type: Meeting['type']) => {
    switch (type) {
      case 'google-meet':
      case 'zoom':
        return <Video className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-2">
              Meetings
            </h1>
            <p className="text-[#4A4A4A]">
              Manage your scheduled and past meetings
            </p>
          </div>
          <button className="px-6 py-3 bg-[#0F766E] text-white rounded-lg hover:bg-[#134E4A] transition-colors font-medium flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create Meeting
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8B8B8]" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E8E8E8] rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                           focus:border-transparent text-[#1A1A1A] 
                           placeholder:text-[#B8B8B8]"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="px-3 py-2 border border-[#E8E8E8] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                         focus:border-transparent text-[#1A1A1A]"
              />
              <span className="text-[#4A4A4A]">to</span>
              <input
                type="date"
                className="px-3 py-2 border border-[#E8E8E8] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                         focus:border-transparent text-[#1A1A1A]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#4A4A4A]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-[#E8E8E8] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                         focus:border-transparent text-[#1A1A1A] cursor-pointer"
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
        <div className="bg-white rounded-lg border border-[#E8E8E8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAF9] border-b border-[#E8E8E8]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">
                    Meeting
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8]">
                {meetings.map((meeting) => (
                  <tr
                    key={meeting.id}
                    className="hover:bg-[#FAFAF9] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[#1A1A1A] font-medium">
                          {new Date(meeting.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-sm text-[#4A4A4A] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.time}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[#1A1A1A] font-medium">
                          {meeting.title}
                        </span>
                        <span className="text-sm text-[#4A4A4A] flex items-center gap-1">
                          {getMeetingIcon(meeting.type)}
                          {meeting.type === 'in-person'
                            ? meeting.location
                            : meeting.type
                                .split('-')
                                .map(
                                  (w) =>
                                    w.charAt(0).toUpperCase() + w.slice(1)
                                )
                                .join(' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#4A4A4A]">
                        {meeting.participants.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#4A4A4A]">
                        {meeting.duration}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(meeting.status)}`}
                      >
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="w-8 h-8 rounded hover:bg-[#E8E8E8] flex items-center justify-center transition-colors">
                        <MoreVertical className="w-4 h-4 text-[#4A4A4A]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-[#E8E8E8] px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-[#4A4A4A]">
              Showing 1-6 of 6 meetings
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-[#E8E8E8] rounded-lg text-[#4A4A4A] hover:bg-[#FAFAF9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 border border-[#E8E8E8] rounded-lg text-[#4A4A4A] hover:bg-[#FAFAF9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
