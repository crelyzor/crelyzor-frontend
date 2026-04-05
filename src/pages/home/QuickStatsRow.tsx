import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckSquare,
  CalendarClock,
  CreditCard,
} from 'lucide-react';
import { useMeetingsAll } from '@/hooks/queries/useMeetingQueries';
import { useBookings } from '@/hooks/queries/useSchedulingQueries';
import { useCards } from '@/hooks/queries/useCardQueries';
import { useAllTasks } from '@/hooks/queries/useSMAQueries';

type StatProps = {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub: string;
  href: string;
  alert?: boolean;
  index: number;
};

function Stat({ icon: Icon, label, value, sub, href, alert, index }: StatProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 + index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => navigate(href)}
      className={`group flex flex-col justify-between p-5 rounded-2xl border text-left w-full
        transition-[border-color,box-shadow,background-color] duration-200 cursor-pointer
        ${
          alert
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-800/70'
            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm dark:hover:shadow-none'
        }`}
    >
      {/* Icon */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center mb-4
          ${alert ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-neutral-100 dark:bg-neutral-800'}`}
      >
        <Icon
          className={`w-3.5 h-3.5
            ${alert ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500 dark:text-neutral-400'}`}
        />
      </div>

      {/* Value */}
      <div>
        <p
          className={`text-[32px] leading-none font-semibold tracking-tight
            ${alert ? 'text-amber-700 dark:text-amber-300' : 'text-neutral-900 dark:text-white'}`}
        >
          {value}
        </p>
        <p className={`text-[10px] font-medium mt-1.5 tracking-[0.08em]
            ${alert ? 'text-amber-600 dark:text-amber-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
          {label}
        </p>
        <p className={`text-[9px] mt-0.5 tracking-wide
            ${alert ? 'text-amber-500/70 dark:text-amber-600' : 'text-neutral-300 dark:text-neutral-600'}`}>
          {sub}
        </p>
      </div>
    </motion.button>
  );
}

export function QuickStatsRow() {
  const { data: allMeetings } = useMeetingsAll();
  const { data: confirmedBookings } = useBookings({ status: 'CONFIRMED' });
  const { data: cards } = useCards();
  const { data: taskData } = useAllTasks({ status: 'pending', limit: 500 });

  // Meetings this week
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const meetingsThisWeek = (allMeetings ?? []).filter((m) => {
    if (m.type === 'VOICE_NOTE') return false;
    const d = new Date(m.startTime);
    return d >= startOfWeek && d <= endOfWeek;
  }).length;

  const openTasks = taskData?.tasks?.length ?? 0;

  const now = new Date();
  const upcomingBookings = (confirmedBookings?.bookings ?? []).filter(
    (b) => new Date(b.startTime) > now
  ).length;

  const cardCount = cards?.length ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat
        index={0}
        icon={CalendarDays}
        label="Meetings this week"
        value={meetingsThisWeek}
        sub="scheduled & recorded"
        href="/meetings"
      />
      <Stat
        index={1}
        icon={CheckSquare}
        label="Open tasks"
        value={openTasks}
        sub={openTasks === 1 ? '1 pending' : `${openTasks} pending`}
        href="/tasks"
        alert={openTasks > 0}
      />
      <Stat
        index={2}
        icon={CalendarClock}
        label="Upcoming bookings"
        value={upcomingBookings}
        sub="confirmed"
        href="/bookings"
      />
      <Stat
        index={3}
        icon={CreditCard}
        label="Digital cards"
        value={cardCount}
        sub="in your collection"
        href="/cards"
      />
    </div>
  );
}
