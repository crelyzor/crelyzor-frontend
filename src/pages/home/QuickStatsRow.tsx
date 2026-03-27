import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CalendarClock, Mic, CreditCard } from 'lucide-react';
import { useMeetingsAll } from '@/hooks/queries/useMeetingQueries';
import { useBookings } from '@/hooks/queries/useSchedulingQueries';
import { useCards } from '@/hooks/queries/useCardQueries';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sublabel?: string;
  href: string;
  highlight?: boolean;
  index: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  href,
  highlight,
  index,
}: StatCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onClick={() => navigate(href)}
      className={`group relative flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer w-full
        ${
          highlight
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700/60'
            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
        }`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center
          ${
            highlight
              ? 'bg-amber-100 dark:bg-amber-900/40'
              : 'bg-neutral-100 dark:bg-neutral-800'
          }`}
      >
        <Icon
          className={`w-4 h-4 ${
            highlight
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        />
      </div>

      <div>
        <p
          className={`text-2xl font-semibold leading-none ${
            highlight
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          {value}
        </p>
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
          {label}
        </p>
        {sublabel && (
          <p
            className={`text-[10px] mt-0.5 ${
              highlight
                ? 'text-amber-500 dark:text-amber-500'
                : 'text-neutral-400 dark:text-neutral-500'
            }`}
          >
            {sublabel}
          </p>
        )}
      </div>
    </motion.button>
  );
}

export function QuickStatsRow() {
  const { data: allMeetings } = useMeetingsAll();
  const { data: pendingBookings } = useBookings({ status: 'PENDING' });
  const { data: cards } = useCards();

  const meetingCount = (allMeetings ?? []).filter(
    (m) =>
      m.type !== 'VOICE_NOTE' &&
      m.status !== 'PENDING_ACCEPTANCE' &&
      m.status !== 'RESCHEDULING_REQUESTED'
  ).length;

  const voiceNoteCount = (allMeetings ?? []).filter(
    (m) => m.type === 'VOICE_NOTE'
  ).length;

  const pendingCount = pendingBookings?.bookings?.length ?? 0;
  const cardCount = cards?.length ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      <StatCard
        index={0}
        icon={CalendarDays}
        label="Meetings"
        value={meetingCount}
        sublabel="total"
        href="/meetings"
      />
      <StatCard
        index={1}
        icon={CalendarClock}
        label="Bookings"
        value={pendingCount}
        sublabel={pendingCount === 1 ? 'pending request' : 'pending requests'}
        href="/bookings"
        highlight={pendingCount > 0}
      />
      <StatCard
        index={2}
        icon={Mic}
        label="Voice Notes"
        value={voiceNoteCount}
        sublabel="recordings"
        href="/voice-notes"
      />
      <StatCard
        index={3}
        icon={CreditCard}
        label="Cards"
        value={cardCount}
        sublabel="digital cards"
        href="/cards"
      />
    </div>
  );
}
