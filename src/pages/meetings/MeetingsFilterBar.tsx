import { useState } from 'react';
import { Search, Filter, CalendarDays, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

type MeetingsFilterBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
};

function formatDateLabel(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MeetingsFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: MeetingsFilterBarProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [openPicker, setOpenPicker] = useState<'from' | 'to' | null>(null);

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
          {/* From */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenPicker(openPicker === 'from' ? null : 'from')
              }
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm transition-colors ${
                dateFrom
                  ? 'border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
              } bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600`}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>{dateFrom ? formatDateLabel(dateFrom) : 'From'}</span>
              {dateFrom && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateFrom('');
                  }}
                  className="ml-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
            {openPicker === 'from' && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenPicker(null)}
                />
                <div className="absolute top-full left-0 mt-1.5 z-50">
                  <DateTimePicker
                    date={dateFrom || null}
                    time=""
                    showTime={false}
                    onDateChange={(iso) => {
                      setDateFrom(iso);
                      setOpenPicker(null);
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <span className="text-neutral-500 dark:text-neutral-400 text-sm">
            to
          </span>

          {/* To */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenPicker(openPicker === 'to' ? null : 'to')}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm transition-colors ${
                dateTo
                  ? 'border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
              } bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600`}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>{dateTo ? formatDateLabel(dateTo) : 'To'}</span>
              {dateTo && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateTo('');
                  }}
                  className="ml-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
            {openPicker === 'to' && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenPicker(null)}
                />
                <div className="absolute top-full left-0 mt-1.5 z-50">
                  <DateTimePicker
                    date={dateTo || null}
                    time=""
                    showTime={false}
                    onDateChange={(iso) => {
                      setDateTo(iso);
                      setOpenPicker(null);
                    }}
                  />
                </div>
              </>
            )}
          </div>
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
