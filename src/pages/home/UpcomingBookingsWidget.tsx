import { useNavigate } from 'react-router-dom';
import { CalendarClock, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useBookings } from '@/hooks/queries/useSchedulingQueries';

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today · ${time}`;
  if (isTomorrow) return `Tomorrow · ${time}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` · ${time}`;
}

export function UpcomingBookingsWidget() {
  const navigate = useNavigate();
  const { data, isLoading } = useBookings({ status: 'CONFIRMED', limit: 5 });

  const now = new Date();
  const upcoming = (data?.bookings ?? [])
    .filter((b) => new Date(b.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4);

  if (!isLoading && upcoming.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
            Upcoming Bookings
          </span>
          {upcoming.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
              {upcoming.length}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-0.5 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
        >
          Manage
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="p-2">
        {isLoading && (
          <div className="space-y-1 p-2 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading &&
          upcoming.map((booking, i) => (
            <motion.button
              key={booking.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              onClick={() => navigate('/bookings')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                         hover:bg-neutral-50 dark:hover:bg-neutral-800/60
                         transition-colors duration-150 text-left"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-semibold text-neutral-500 dark:text-neutral-400">
                  {initials(booking.guestName)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {booking.guestName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 truncate">
                    {booking.eventType.title}
                  </span>
                  <span className="text-[9px] text-neutral-200 dark:text-neutral-700">·</span>
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 shrink-0">
                    {fmtTime(booking.startTime)}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
      </div>
    </div>
  );
}
