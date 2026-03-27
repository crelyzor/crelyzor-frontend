import { useState } from 'react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import {
  CalendarClock,
  Check,
  X,
  Ban,
  Clock,
  User,
  Mail,
  Video,
  MapPin,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageMotion } from '@/components/PageMotion';
import {
  useBookings,
  useConfirmBooking,
  useDeclineBooking,
  useCancelBooking,
} from '@/hooks/queries/useSchedulingQueries';
import type { HostBooking, BookingStatus } from '@/types/settings';

// ── Types ──────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DECLINED';

const FILTER_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Declined', value: 'DECLINED' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getStatusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    DECLINED: 'Declined',
    CANCELLED: 'Cancelled',
    RESCHEDULED: 'Rescheduled',
    NO_SHOW: 'No Show',
  };
  return map[status] ?? status;
}

function getStatusStyle(status: BookingStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
    case 'DECLINED':
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400';
    case 'RESCHEDULED':
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
  }
}

function getLocationIcon(locationType: string) {
  switch (locationType) {
    case 'ONLINE':
      return <Video className="w-3 h-3" />;
    case 'PHONE':
      return <Phone className="w-3 h-3" />;
    default:
      return <MapPin className="w-3 h-3" />;
  }
}

// ── BookingRow ─────────────────────────────────────────────────────────────

function BookingRow({
  booking,
  index,
}: {
  booking: HostBooking;
  index: number;
}) {
  const confirm = useConfirmBooking();
  const decline = useDeclineBooking();
  const cancel = useCancelBooking();

  const start = parseISO(booking.startTime);
  const end = parseISO(booking.endTime);

  const isPending = booking.status === 'PENDING';
  const isConfirmed = booking.status === 'CONFIRMED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className="group flex items-start gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
    >
      {/* Date block */}
      <div className="shrink-0 w-12 text-center pt-0.5">
        <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          {format(start, 'MMM')}
        </p>
        <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 leading-none mt-0.5">
          {format(start, 'd')}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {booking.eventType.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <Clock className="w-3 h-3 shrink-0" />
              <span>
                {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">·</span>
              {getLocationIcon(booking.eventType.locationType)}
              <span className="capitalize">
                {booking.eventType.locationType.toLowerCase()}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusStyle(booking.status)}`}
          >
            {getStatusLabel(booking.status)}
          </span>
        </div>

        {/* Guest info */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <User className="w-3 h-3 shrink-0" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {booking.guestName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
            <Mail className="w-3 h-3 shrink-0" />
            <span>{booking.guestEmail}</span>
          </div>
        </div>

        {/* Guest note */}
        {booking.guestNote && (
          <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 italic line-clamp-2">
            "{booking.guestNote}"
          </p>
        )}

        {/* Cancel reason */}
        {booking.cancelReason && (
          <p className="mt-1.5 text-[11px] text-red-500 dark:text-red-400 line-clamp-1">
            Reason: {booking.cancelReason}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
        {isPending && (
          <>
            <Button
              size="xs"
              onClick={() => confirm.mutate(booking.id)}
              disabled={confirm.isPending}
              className="h-7 px-2.5 text-[11px]"
            >
              <Check className="w-3 h-3 mr-1" />
              Confirm
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => decline.mutate({ id: booking.id })}
              disabled={decline.isPending}
              className="h-7 px-2.5 text-[11px] text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="w-3 h-3 mr-1" />
              Decline
            </Button>
          </>
        )}
        {isConfirmed && (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => cancel.mutate({ id: booking.id })}
            disabled={cancel.isPending}
            className="h-7 px-2.5 text-[11px] text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
          >
            <Ban className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function BookingRowSkeleton() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 animate-pulse">
      <div className="shrink-0 w-12 space-y-1.5">
        <div className="h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded w-8 mx-auto" />
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-10 mx-auto" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-2/5" />
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800/60 rounded w-1/3" />
        <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800/60 rounded w-1/2 mt-1" />
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterStatus }) {
  const messages: Record<FilterStatus, { title: string; subtitle: string }> = {
    all: {
      title: 'No bookings yet',
      subtitle: 'Bookings from your scheduling page will appear here',
    },
    PENDING: {
      title: 'No pending bookings',
      subtitle: 'New requests will show up here',
    },
    CONFIRMED: {
      title: 'No confirmed bookings',
      subtitle: 'Accepted bookings will appear here',
    },
    CANCELLED: {
      title: 'No cancelled bookings',
      subtitle: 'Cancelled bookings will appear here',
    },
    DECLINED: {
      title: 'No declined bookings',
      subtitle: 'Declined bookings will appear here',
    },
  };
  const { title, subtitle } = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
        <CalendarClock className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
      </div>
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {title}
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
        {subtitle}
      </p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Bookings() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  const params = activeFilter !== 'all' ? { status: activeFilter } : {};
  const { data, isLoading, isError } = useBookings(params);

  const bookings = data?.bookings ?? [];

  return (
    <PageMotion>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Bookings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Manage requests from your scheduling page
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === tab.value
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <BookingRowSkeleton key={i} />
            ))}
          </>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Failed to load bookings
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          bookings.map((booking, i) => (
            <BookingRow key={booking.id} booking={booking} index={i} />
          ))
        )}
      </div>
    </PageMotion>
  );
}
