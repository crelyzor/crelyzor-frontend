import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

type MeetingsFilterBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
};

export function MeetingsFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: MeetingsFilterBarProps) {
  return (
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
                onSearchChange(e.target.value)
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
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">
            to
          </span>
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
            onChange={(e) => onStatusFilterChange(e.target.value)}
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
  );
}
