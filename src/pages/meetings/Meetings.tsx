import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { scheduledMeetings } from '@/data';
import { MeetingsFilterBar } from './MeetingsFilterBar';
import { MeetingsTable } from './MeetingsTable';

export default function Meetings() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      <MeetingsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Meetings Table */}
      <MeetingsTable meetings={scheduledMeetings} />
    </div>
  );
}
